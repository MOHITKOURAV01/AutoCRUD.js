import Logger from './Logger.js';
import ResponseFormatter from '../utils/ResponseFormatter.js';

/**
 * ErrorHandler - Centralized Express middleware for processing and standardizing errors.
 * Handles specific Mongoose errors, configuration errors, and general exceptions.
 * 
 * @param {Error} err - The error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 */
const ErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 1. Log the full error using our custom Logger
  Logger.error(err.stack || err.message);

  // 2. Handle Specific Error Types

  // Mongoose: Invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    return ResponseFormatter.error(res, message, 400);
  }

  // Mongoose: Duplicate key (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered: ${field}`;
    return ResponseFormatter.error(res, message, 409);
  }

  // Mongoose: Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    return ResponseFormatter.error(res, 'Validation Error', 400, errors);
  }

  // Framework: Config Validation Error
  if (err.name === 'ConfigValidationError') {
    return ResponseFormatter.error(res, `Internal Configuration Error: ${err.message}`, 500);
  }

  // 3. Prepare Final Response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  // In development, include stack trace for debugging
  const finalErrors = process.env.NODE_ENV === 'development' ? { stack: err.stack } : [];

  return res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default ErrorHandler;
