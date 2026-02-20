import axios from 'axios';
import { logger } from '../utils/logger.js';

class OllamaService {
  constructor() {
    this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2:3b';
    this.timeout = 120000; // 120 seconds (first request can be slow on cold start)
  }

  /**
   * Test connection to Ollama
   */
  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000
      });

      const modelExists = response.data.models?.some(m => m.name.includes(this.model.split(':')[0]));

      return {
        connected: true,
        model: this.model,
        available: modelExists
      };
    } catch (error) {
      logger.error('Ollama connection test failed:', error.message);
      return {
        connected: false,
        model: this.model,
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Generate response from Ollama with JSON parsing
   */
  async generate(prompt, options = {}) {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Sending prompt to Ollama (${this.model}), attempt ${attempt}/${maxRetries}...`);

        const requestBody = {
          model: this.model,
          prompt: prompt,
          stream: false,
          format: 'json', // Force Ollama to output valid JSON
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            ...options
          }
        };

        const response = await axios.post(
          `${this.baseURL}/api/generate`,
          requestBody,
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const rawResponse = response.data.response;
        logger.info('Received response from Ollama');

        // Parse JSON from response
        const jsonResponse = this.extractJSON(rawResponse);

        return {
          success: true,
          data: jsonResponse,
          raw: rawResponse
        };

      } catch (error) {
        // Connection/timeout errors — don't retry
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to Ollama. Make sure Ollama is running.');
        }
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
          throw new Error('Ollama request timed out. The model might be too slow.');
        }

        // JSON parsing errors — retry if attempts remain
        if (attempt < maxRetries && error.message.includes('JSON')) {
          logger.warn(`JSON parse failed on attempt ${attempt}, retrying...`);
          continue;
        }

        logger.error('Ollama generation failed:', error.message);
        throw new Error(`Ollama error: ${error.message}`);
      }
    }
  }

  /**
   * Extract JSON from Ollama response
   * Handles cases where model adds extra text around JSON
   */
  extractJSON(text) {
    if (!text || !text.trim()) {
      throw new Error('Empty response from Ollama');
    }

    // 1. Direct parse
    try {
      return JSON.parse(text);
    } catch (e) {
      // continue to extraction strategies
    }

    // 2. Strip markdown code fences (```json ... ``` or ``` ... ```)
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch (e) {
        // continue
      }
    }

    // 3. Find the outermost { ... } block
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // 4. Try cleaning control characters that break JSON
        const cleaned = jsonMatch[0]
          .replace(/[\x00-\x1F\x7F]/g, (ch) => ch === '\n' || ch === '\r' || ch === '\t' ? ch : '')
          .replace(/,\s*}/g, '}')   // trailing commas
          .replace(/,\s*]/g, ']');
        try {
          return JSON.parse(cleaned);
        } catch (e2) {
          logger.error('Failed to parse extracted JSON:', jsonMatch[0].substring(0, 500));
          throw new Error('Invalid JSON in response');
        }
      }
    }

    logger.error('No valid JSON found in response:', text.substring(0, 500));
    throw new Error('No JSON found in Ollama response');
  }

  /**
   * Generate interview question
   */
  async generateQuestion(prompt) {
    const result = await this.generate(prompt, {
      temperature: 0.8 // Slightly higher for creativity in questions
    });

    // Validate response structure
    if (!result.data.question || !result.data.type || !result.data.difficulty) {
      throw new Error('Invalid question format from Ollama');
    }

    return result.data;
  }

  /**
   * Evaluate an answer
   */
  async evaluateAnswer(prompt) {
    const result = await this.generate(prompt, {
      temperature: 0.6 // Lower for more consistent evaluation
    });

    // Validate response structure
    if (typeof result.data.score !== 'number' || !result.data.feedback) {
      throw new Error('Invalid evaluation format from Ollama');
    }

    // Ensure score is in valid range
    result.data.score = Math.max(0, Math.min(100, result.data.score));

    return result.data;
  }

  /**
   * Generate final report
   */
  async generateReport(prompt) {
    const result = await this.generate(prompt, {
      temperature: 0.7
    });

    // Validate response structure
    if (typeof result.data.overallScore !== 'number' || !result.data.summary) {
      throw new Error('Invalid report format from Ollama');
    }

    return result.data;
  }
}

// Export singleton instance
export const ollamaService = new OllamaService();
