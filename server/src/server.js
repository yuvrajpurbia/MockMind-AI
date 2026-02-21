import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import interviewRoutes from './routes/interviewRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { ollamaService } from './services/ollamaService.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', interviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MockMind AI Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Test LLM connection on startup
    logger.info(`Testing ${ollamaService.provider} connection...`);
    const llmStatus = await ollamaService.testConnection();

    if (!llmStatus.connected) {
      logger.warn(`⚠️  WARNING: Cannot connect to ${ollamaService.provider}!`);
      if (!ollamaService.useGroq) {
        logger.warn('Make sure Ollama is running: ollama serve');
      }
      logger.warn('Server will start but interview features will not work.');
    } else if (!llmStatus.available) {
      logger.warn(`⚠️  WARNING: Model ${ollamaService.model} not found!`);
      if (!ollamaService.useGroq) {
        logger.warn(`Please install it: ollama pull ${ollamaService.model}`);
      }
      logger.warn('Server will start but interview features will not work.');
    } else {
      logger.info(`✅ ${ollamaService.provider} connected successfully with model: ${llmStatus.model}`);
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info('🚀 MockMind AI Server Started Successfully');
      logger.info('='.repeat(50));
      logger.info(`📡 Server running on: http://localhost:${PORT}`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🤖 LLM Provider: ${ollamaService.provider}`);
      logger.info(`🧠 LLM Model: ${ollamaService.model}`);
      logger.info('='.repeat(50));
      logger.info('📚 API Endpoints:');
      logger.info('   POST   /api/interviews/start');
      logger.info('   POST   /api/interviews/:sessionId/answer');
      logger.info('   POST   /api/interviews/:sessionId/end');
      logger.info('   GET    /api/interviews/:sessionId/status');
      logger.info('   GET    /api/reports/:reportId');
      logger.info('   GET    /api/health/ollama');
      logger.info('   GET    /health');
      logger.info('='.repeat(50));
    });

  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
