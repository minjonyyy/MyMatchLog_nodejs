export const successResponse = (res, data, message = 'Request successful') => {
  return res.status(200).json({
    success: true,
    data,
    message,
  });
};

export const createdResponse = (res, data, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    data,
    message,
  });
};

export const errorResponse = (res, error) => {
  const { statusCode = 500, code, message } = error;
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
    timestamp: new Date().toISOString(),
  });
}; 