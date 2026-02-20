import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

class SessionManager {
  constructor() {
    // In-memory storage for active sessions
    this.sessions = new Map();
    this.reports = new Map();

    // Configuration
    this.maxSessionAge = parseInt(process.env.MAX_SESSION_AGE_MS) || 7200000; // 2 hours default
    this.dataDir = path.join(process.cwd(), 'data', 'sessions');

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Create a new interview session
   */
  createSession({ role, level, topics }) {
    const sessionId = uuidv4();

    const session = {
      sessionId,
      config: {
        role,
        level,
        topics: Array.isArray(topics) ? topics : [topics]
      },
      status: 'active',
      startTime: Date.now(),
      endTime: null,
      questions: [],
      answers: [],
      currentQuestionIndex: 0,
      context: {
        conversationHistory: '',
        topicsCovered: [],
        difficultyProgression: []
      }
    };

    this.sessions.set(sessionId, session);
    logger.info(`Created session: ${sessionId}`);

    return session;
  }

  /**
   * Get session by ID (memory-first, disk fallback)
   */
  async getSession(sessionId) {
    // Try memory first
    const session = this.sessions.get(sessionId);

    if (session) {
      // Check if session has expired
      const age = Date.now() - session.startTime;
      if (age > this.maxSessionAge) {
        this.sessions.delete(sessionId);
        throw new Error('Session has expired');
      }
      return session;
    }

    // Fallback: load from disk (handles server restarts mid-interview)
    try {
      const filePath = path.join(this.dataDir, `session-${sessionId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const loaded = JSON.parse(data);

      // Re-cache in memory
      this.sessions.set(sessionId, loaded);
      logger.info(`Restored session from disk: ${sessionId}`);
      return loaded;
    } catch {
      throw new Error(`Session not found: ${sessionId}`);
    }
  }

  /**
   * Add question to session
   */
  async addQuestion(sessionId, question) {
    const session = await this.getSession(sessionId);

    const questionData = {
      questionId: uuidv4(),
      ...question,
      askedAt: Date.now()
    };

    session.questions.push(questionData);
    session.context.difficultyProgression.push(question.difficulty);

    logger.info(`Added question to session ${sessionId}`);

    return questionData;
  }

  /**
   * Add answer to session
   */
  async addAnswer(sessionId, questionId, answer, evaluation) {
    const session = await this.getSession(sessionId);

    const answerData = {
      answerId: uuidv4(),
      questionId,
      transcription: answer,
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        keyPointsCovered: evaluation.keyPointsCovered || []
      },
      submittedAt: Date.now()
    };

    session.answers.push(answerData);
    session.currentQuestionIndex++;

    // Update conversation history (keep last 3 Q&A pairs to save memory)
    this.updateConversationHistory(session);

    logger.info(`Added answer to session ${sessionId}, score: ${evaluation.score}`);

    return answerData;
  }

  /**
   * Update conversation history summary
   */
  updateConversationHistory(session) {
    const recentPairs = [];
    const startIndex = Math.max(0, session.answers.length - 3);

    for (let i = startIndex; i < session.answers.length; i++) {
      const answer = session.answers[i];
      const question = session.questions.find(q => q.questionId === answer.questionId);

      if (question) {
        recentPairs.push(
          `Q: ${question.question}\nA: ${answer.transcription}\nScore: ${answer.evaluation.score}/100`
        );
      }
    }

    session.context.conversationHistory = recentPairs.join('\n\n');

    // Update topics covered
    session.questions.forEach(q => {
      if (q.type && !session.context.topicsCovered.includes(q.type)) {
        session.context.topicsCovered.push(q.type);
      }
    });
  }

  /**
   * Get uncovered topics
   */
  async getUncoveredTopics(sessionId) {
    const session = await this.getSession(sessionId);
    const allTopics = session.config.topics;
    const covered = session.context.topicsCovered;

    return allTopics.filter(topic =>
      !covered.some(c => c.toLowerCase().includes(topic.toLowerCase()))
    );
  }

  /**
   * Get Q&A pairs for report generation
   */
  async getQAPairs(sessionId) {
    const session = await this.getSession(sessionId);

    return session.answers.map(answer => {
      const question = session.questions.find(q => q.questionId === answer.questionId);

      return {
        question: question?.question || 'Unknown question',
        answer: answer.transcription,
        score: answer.evaluation.score,
        feedback: answer.evaluation.feedback
      };
    });
  }

  /**
   * End session and create report
   */
  async endSession(sessionId, reportData) {
    const session = await this.getSession(sessionId);

    session.status = 'completed';
    session.endTime = Date.now();

    const reportId = uuidv4();
    const report = {
      reportId,
      sessionId,
      ...reportData,
      generatedAt: Date.now()
    };

    this.reports.set(reportId, report);

    // Persist session and report to disk (must succeed before responding)
    await this.persistSession(session);
    await this.persistReport(report);

    // Remove from active sessions after 10 minutes (keep for retrieval)
    setTimeout(() => {
      this.sessions.delete(sessionId);
      logger.info(`Removed completed session from memory: ${sessionId}`);
    }, 600000); // 10 minutes

    logger.info(`Session ended: ${sessionId}, Report: ${reportId}`);

    return { reportId, report };
  }

  /**
   * Get report by ID (memory-first, disk fallback)
   */
  async getReport(reportId) {
    const cached = this.reports.get(reportId);
    if (cached) return cached;

    // Fallback: load from disk
    try {
      const filePath = path.join(this.dataDir, `report-${reportId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const report = JSON.parse(data);

      // Re-cache for subsequent requests
      this.reports.set(reportId, report);
      logger.info(`Loaded report from disk: ${reportId}`);
      return report;
    } catch (error) {
      throw new Error(`Report not found: ${reportId}`);
    }
  }

  /**
   * Get session from disk (for completed sessions)
   */
  async getSessionFromDisk(sessionId) {
    const cached = this.sessions.get(sessionId);
    if (cached) return cached;

    try {
      const filePath = path.join(this.dataDir, `session-${sessionId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Session not found: ${sessionId}`);
    }
  }

  /**
   * Persist session to disk
   */
  async persistSession(session) {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });

      const filename = path.join(this.dataDir, `session-${session.sessionId}.json`);
      await fs.writeFile(filename, JSON.stringify(session, null, 2), 'utf-8');

      logger.info(`Persisted session to disk: ${session.sessionId}`);
    } catch (error) {
      logger.error(`Failed to persist session: ${error.message}`);
      throw error; // Don't swallow — caller needs to know
    }
  }

  /**
   * Persist report to disk
   */
  async persistReport(report) {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });

      const filename = path.join(this.dataDir, `report-${report.reportId}.json`);
      await fs.writeFile(filename, JSON.stringify(report, null, 2), 'utf-8');

      logger.info(`Persisted report to disk: ${report.reportId}`);
    } catch (error) {
      logger.error(`Failed to persist report: ${error.message}`);
      throw error; // Don't swallow — caller needs to know
    }
  }

  /**
   * Cleanup expired sessions
   */
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      let removed = 0;

      for (const [sessionId, session] of this.sessions.entries()) {
        const age = now - session.startTime;

        if (age > this.maxSessionAge && session.status === 'active') {
          this.sessions.delete(sessionId);
          removed++;
        }
      }

      if (removed > 0) {
        logger.info(`Cleaned up ${removed} expired sessions`);
      }
    }, 600000); // Run every 10 minutes
  }

  /**
   * Get session statistics
   */
  getStats() {
    return {
      activeSessions: this.sessions.size,
      reportsStored: this.reports.size
    };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
