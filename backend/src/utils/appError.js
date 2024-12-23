class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Call the parent Error constructor
    this.statusCode = statusCode || 500; // Default to 500 if no status is provided
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
