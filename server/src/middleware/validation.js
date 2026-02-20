import Joi from 'joi';
import { logger } from '../utils/logger.js';

/**
 * Validation schemas
 */
const schemas = {
  startInterview: Joi.object({
    role: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Role is required',
      'string.min': 'Role must be at least 2 characters',
      'string.max': 'Role must not exceed 100 characters'
    }),
    level: Joi.string().required().valid('Junior', 'Mid-level', 'Senior', 'Lead', 'Principal').messages({
      'any.required': 'Level is required',
      'any.only': 'Level must be one of: Junior, Mid-level, Senior, Lead, Principal'
    }),
    topics: Joi.array().items(Joi.string()).min(1).max(5).required().messages({
      'array.min': 'At least one topic is required',
      'array.max': 'Maximum 5 topics allowed',
      'any.required': 'Topics are required'
    })
  }),

  submitAnswer: Joi.object({
    answer: Joi.string().required().min(10).max(5000).messages({
      'string.empty': 'Answer is required',
      'string.min': 'Answer must be at least 10 characters',
      'string.max': 'Answer must not exceed 5000 characters'
    }),
    audioMetadata: Joi.object({
      duration: Joi.number(),
      pauseCount: Joi.number(),
      averageConfidence: Joi.number()
    }).optional()
  })
};

/**
 * Validate request middleware factory
 */
export function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];

    if (!schema) {
      logger.error(`Validation schema not found: ${schemaName}`);
      return next(new Error('Internal validation error'));
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation failed:', errors);

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
}
