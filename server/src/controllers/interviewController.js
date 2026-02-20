import { evaluationService } from '../services/evaluationService.js';
import { sessionManager } from '../services/sessionManager.js';
import { ollamaService } from '../services/ollamaService.js';
import { logger } from '../utils/logger.js';

/**
 * Start a new interview session
 */
export async function startInterview(req, res, next) {
  try {
    const { role, level, topics } = req.body;

    logger.info(`Starting new interview: ${role} - ${level}`);

    // Create session
    const session = sessionManager.createSession({ role, level, topics });

    // Generate first question
    const firstQuestion = await evaluationService.generateInitialQuestion({
      role,
      level,
      topics
    });

    // Add question to session
    await sessionManager.addQuestion(session.sessionId, firstQuestion);

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        question: firstQuestion
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Submit an answer and get evaluation + next question
 */
export async function submitAnswer(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { answer } = req.body;

    logger.info(`Answer submitted for session: ${sessionId}`);

    // Evaluate answer and get next question
    const result = await evaluationService.evaluateAndGenerateNext(sessionId, answer);

    res.json({
      success: true,
      data: {
        evaluation: result.evaluation,
        nextQuestion: result.nextQuestion,
        shouldContinue: result.shouldContinue
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * End interview and generate report
 */
export async function endInterview(req, res, next) {
  try {
    const { sessionId } = req.params;

    logger.info(`Ending interview session: ${sessionId}`);

    // Generate final report
    const { reportId, report } = await evaluationService.generateFinalReport(sessionId);

    res.json({
      success: true,
      data: {
        reportId,
        report
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get interview session status
 */
export async function getSessionStatus(req, res, next) {
  try {
    const { sessionId } = req.params;

    const session = await sessionManager.getSession(sessionId);

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: session.questions.length,
        totalAnswers: session.answers.length,
        config: session.config
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get interview report (enriched with session metadata)
 */
export async function getReport(req, res, next) {
  try {
    const { reportId } = req.params;

    const report = await sessionManager.getReport(reportId);

    // Enrich with session metadata (role, level, duration, etc.)
    let session = null;
    try {
      const sessionData = await sessionManager.getSessionFromDisk(report.sessionId);
      session = {
        role: sessionData.config.role,
        level: sessionData.config.level,
        topics: sessionData.config.topics,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        duration: sessionData.endTime && sessionData.startTime
          ? Math.round((sessionData.endTime - sessionData.startTime) / 1000)
          : null,
      };
    } catch (err) {
      logger.warn(`Could not load session for report ${reportId}: ${err.message}`);
    }

    res.json({
      success: true,
      data: {
        ...report,
        session,
      },
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Check Ollama health
 */
export async function checkOllamaHealth(req, res, next) {
  try {
    const status = await ollamaService.testConnection();

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get server statistics
 */
export async function getStats(req, res, next) {
  try {
    const stats = sessionManager.getStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
}
