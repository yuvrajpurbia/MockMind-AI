import axios from 'axios';
import { logger } from '../utils/logger.js';

class OllamaService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || null;
    this.useGroq = !!this.groqApiKey;

    if (this.useGroq) {
      this.baseURL = 'https://api.groq.com/openai/v1';
      this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      this.timeout = 60000;
      this.provider = 'Groq';
      logger.info(`LLM Provider: Groq (model: ${this.model})`);
    } else {
      this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      this.model = process.env.OLLAMA_MODEL || 'llama3.2:3b';
      this.timeout = 120000;
      this.provider = 'Ollama';
    }
  }

  /**
   * Test connection to the LLM provider
   */
  async testConnection() {
    if (this.useGroq) return this._testGroqConnection();
    return this._testOllamaConnection();
  }

  async _testOllamaConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000
      });
      const modelExists = response.data.models?.some(m => m.name.includes(this.model.split(':')[0]));
      return { connected: true, model: this.model, available: modelExists };
    } catch (error) {
      logger.error('Ollama connection test failed:', error.message);
      return { connected: false, model: this.model, available: false, error: error.message };
    }
  }

  async _testGroqConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        timeout: 5000,
        headers: { Authorization: `Bearer ${this.groqApiKey}` }
      });
      const modelExists = response.data.data?.some(m => m.id === this.model);
      return { connected: true, model: this.model, available: modelExists };
    } catch (error) {
      logger.error('Groq connection test failed:', error.message);
      return { connected: false, model: this.model, available: false, error: error.message };
    }
  }

  /**
   * Generate response from LLM with JSON parsing
   */
  async generate(prompt, options = {}) {
    if (this.useGroq) return this._generateGroq(prompt, options);
    return this._generateOllama(prompt, options);
  }

  async _generateOllama(prompt, options = {}) {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Sending prompt to Ollama (${this.model}), attempt ${attempt}/${maxRetries}...`);

        const requestBody = {
          model: this.model,
          prompt: prompt,
          stream: false,
          format: 'json',
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            ...options
          }
        };

        const response = await axios.post(
          `${this.baseURL}/api/generate`,
          requestBody,
          { timeout: this.timeout, headers: { 'Content-Type': 'application/json' } }
        );

        const rawResponse = response.data.response;
        logger.info('Received response from Ollama');
        const jsonResponse = this.extractJSON(rawResponse);
        return { success: true, data: jsonResponse, raw: rawResponse };

      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to Ollama. Make sure Ollama is running.');
        }
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
          throw new Error('Ollama request timed out. The model might be too slow.');
        }
        if (attempt < maxRetries && error.message.includes('JSON')) {
          logger.warn(`JSON parse failed on attempt ${attempt}, retrying...`);
          continue;
        }
        logger.error('Ollama generation failed:', error.message);
        throw new Error(`Ollama error: ${error.message}`);
      }
    }
  }

  async _generateGroq(prompt, options = {}) {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Sending prompt to Groq (${this.model}), attempt ${attempt}/${maxRetries}...`);

        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: this.model,
            messages: [
              { role: 'system', content: 'You are an expert technical interviewer. Always respond with valid JSON only.' },
              { role: 'user', content: prompt }
            ],
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            response_format: { type: 'json_object' }
          },
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.groqApiKey}`
            }
          }
        );

        const rawResponse = response.data.choices[0].message.content;
        logger.info('Received response from Groq');
        const jsonResponse = this.extractJSON(rawResponse);
        return { success: true, data: jsonResponse, raw: rawResponse };

      } catch (error) {
        if (error.response?.status === 429) {
          const waitMs = 2000 * attempt;
          logger.warn(`Groq rate limited, waiting ${waitMs}ms...`);
          await new Promise(r => setTimeout(r, waitMs));
          continue;
        }
        if (attempt < maxRetries && error.message.includes('JSON')) {
          logger.warn(`JSON parse failed on attempt ${attempt}, retrying...`);
          continue;
        }
        logger.error('Groq generation failed:', error.message);
        throw new Error(`LLM error: ${error.message}`);
      }
    }
  }

  /**
   * Extract JSON from LLM response
   */
  extractJSON(text) {
    if (!text || !text.trim()) {
      throw new Error('Empty response from LLM');
    }

    try { return JSON.parse(text); } catch (e) { /* continue */ }

    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try { return JSON.parse(fenceMatch[1].trim()); } catch (e) { /* continue */ }
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } catch (e) {
        const cleaned = jsonMatch[0]
          .replace(/[\x00-\x1F\x7F]/g, (ch) => ch === '\n' || ch === '\r' || ch === '\t' ? ch : '')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        try { return JSON.parse(cleaned); } catch (e2) {
          logger.error('Failed to parse extracted JSON:', jsonMatch[0].substring(0, 500));
          throw new Error('Invalid JSON in response');
        }
      }
    }

    logger.error('No valid JSON found in response:', text.substring(0, 500));
    throw new Error('No JSON found in LLM response');
  }

  async generateQuestion(prompt) {
    const result = await this.generate(prompt, { temperature: 0.8 });
    if (!result.data.question || !result.data.type || !result.data.difficulty) {
      throw new Error('Invalid question format from LLM');
    }
    return result.data;
  }

  async evaluateAnswer(prompt) {
    const result = await this.generate(prompt, { temperature: 0.6 });
    if (typeof result.data.score !== 'number' || !result.data.feedback) {
      throw new Error('Invalid evaluation format from LLM');
    }
    result.data.score = Math.max(0, Math.min(100, result.data.score));
    return result.data;
  }

  async generateReport(prompt) {
    const result = await this.generate(prompt, { temperature: 0.7 });
    if (typeof result.data.overallScore !== 'number' || !result.data.summary) {
      throw new Error('Invalid report format from LLM');
    }
    return result.data;
  }
}

export const ollamaService = new OllamaService();
