import { ZodError } from "zod";
import { AppError, isAppError } from "../utils/appError.js";

export const notFoundHandler = (req, _res, next) => {
  next(new AppError(404, `Rota não encontrada: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.flatten()
    });
  }

  if (isAppError(error)) {
    return res.status(error.statusCode).json({
      message: error.message,
      ...(error.details && { details: error.details })
    });
  }

  console.error(error);
  return res.status(500).json({
    message: "Internal server error"
  });
};
