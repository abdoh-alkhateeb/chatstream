// middlewares/validateMiddleware.js
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({ status: 'fail', errors: errorMessages });
    }

    req.validatedBody = value;

    next();
  };
};

export default validate;
