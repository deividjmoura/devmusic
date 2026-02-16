import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
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

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      message: "Banco de dados indisponível. Verifique se o PostgreSQL está rodando em localhost:5432."
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022") {
    return res.status(500).json({
      message: "Estrutura do banco desatualizada. Aplique as migrations do Prisma e reinicie o backend."
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
    return res.status(500).json({
      message: "Tabela ausente no banco. Aplique as migrations do Prisma e reinicie o backend."
    });
  }

  console.error(error);
  return res.status(500).json({
    message: "Internal server error"
  });
};
