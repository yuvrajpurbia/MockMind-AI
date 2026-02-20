import express from 'express';
import {
  startInterview,
  submitAnswer,
  endInterview,
  getSessionStatus,
  getReport,
  checkOllamaHealth,
  getStats
} from '../controllers/interviewController.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Interview routes
router.post('/interviews/start', validate('startInterview'), startInterview);
router.post('/interviews/:sessionId/answer', validate('submitAnswer'), submitAnswer);
router.post('/interviews/:sessionId/end', endInterview);
router.get('/interviews/:sessionId/status', getSessionStatus);

// Report routes
router.get('/reports/:reportId', getReport);

// Health check routes
router.get('/health/ollama', checkOllamaHealth);
router.get('/stats', getStats);

export default router;
