const errorMiddleware = (err, req, res, _) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific error types (you can customize these)
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥:', err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else if (process.env.NODE_ENV === 'production') {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('ERROR 💥:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

export default errorMiddleware;
