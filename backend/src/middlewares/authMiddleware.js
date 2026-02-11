import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";

export function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError(401, "Token not provided"));
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError(401, "Invalid token format"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    return next();
  } catch (_error) {
    return next(new AppError(401, "Invalid token"));
  }
}
