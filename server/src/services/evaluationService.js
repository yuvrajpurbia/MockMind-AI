import { ollamaService } from './ollamaService.js';
import { prompts } from '../config/prompts.js';
import { sessionManager } from './sessionManager.js';
import { logger } from '../utils/logger.js';

class EvaluationService {
  /**
   * Generate initial interview question
   */
  async generateInitialQuestion({ role, level, topics }) {
    try {
      logger.info(`Generating initial question for ${role} - ${level}`);

      const prompt = prompts.generateInitialQuestion({ role, level, topics });
      const question = await ollamaService.generateQuestion(prompt);

      return question;
    } catch (error) {
      logger.error('Failed to generate initial question:', error.message);
      throw error;
    }
  }

  /**
   * Evaluate an answer and generate follow-up question
   */
  async evaluateAndGenerateNext(sessionId, answer) {
    try {
      const session = await sessionManager.getSession(sessionId);

      // Get current question
      const currentQuestion = session.questions[session.currentQuestionIndex];

      if (!currentQuestion) {
        throw new Error('No active question found');
      }

      // Evaluate the answer
      logger.info(`Evaluating answer for session ${sessionId}`);

      const evaluationPrompt = prompts.evaluateAnswer({
        question: currentQuestion.question,
        answer: answer,
        expectedKeyPoints: currentQuestion.expectedKeyPoints || [],
        role: session.config.role,
      });

      const evaluation = await ollamaService.evaluateAnswer(evaluationPrompt);

      // Save answer with evaluation
      await sessionManager.addAnswer(sessionId, currentQuestion.questionId, answer, evaluation);

      // Check if we should continue the interview
      const shouldContinue = this.shouldContinueInterview(session);

      let nextQuestion = null;

      if (shouldContinue) {
        // Generate follow-up question
        logger.info(`Generating follow-up question for session ${sessionId}`);

        const followUpPrompt = prompts.generateFollowUp({
          role: session.config.role,
          level: session.config.level,
          history: session.context.conversationHistory,
          lastScore: evaluation.score,
          topicsCovered: session.context.topicsCovered,
          uncoveredTopics: await sessionManager.getUncoveredTopics(sessionId)
        });

        nextQuestion = await ollamaService.generateQuestion(followUpPrompt);

        // Add next question to session
        await sessionManager.addQuestion(sessionId, nextQuestion);
      }

      // Persist session after each Q&A cycle so it survives server restarts
      await sessionManager.persistSession(session);

      return {
        evaluation,
        nextQuestion,
        shouldContinue
      };

    } catch (error) {
      logger.error('Failed to evaluate answer:', error.message);
      throw error;
    }
  }

  /**
   * Determine if interview should continue
   */
  shouldContinueInterview(session) {
    const maxQuestions = 10;
    const minQuestions = 3;

    // Continue if we haven't reached minimum
    if (session.answers.length < minQuestions) {
      return true;
    }

    // Stop if we've reached maximum
    if (session.answers.length >= maxQuestions) {
      return false;
    }

    // Stop if interview has been running for more than 30 minutes
    const duration = Date.now() - session.startTime;
    if (duration > 1800000) { // 30 minutes
      return false;
    }

    // Continue by default
    return true;
  }

  /**
   * Generate final interview report
   */
  async generateFinalReport(sessionId) {
    try {
      const session = await sessionManager.getSession(sessionId);

      logger.info(`Generating final report for session ${sessionId}`);

      const qaPairs = await sessionManager.getQAPairs(sessionId);
      const duration = session.endTime ? (session.endTime - session.startTime) / 1000 : 0;

      const reportPrompt = prompts.generateReport({
        role: session.config.role,
        level: session.config.level,
        qaPairs,
        duration
      });

      const reportData = await ollamaService.generateReport(reportPrompt);

      // Add Q&A pairs to report
      reportData.qaPairs = qaPairs;

      // End session and create report
      const { reportId, report } = await sessionManager.endSession(sessionId, reportData);

      return { reportId, report };

    } catch (error) {
      logger.error('Failed to generate report:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const evaluationService = new EvaluationService();
