import { AppError } from "../utils/appError.js";

export const validate = (schema, source = "body") => (req, _res, next) => {
  const payload = req[source] ?? {};
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return next(
      new AppError(400, "Validation failed", parsed.error.flatten())
    );
  }

  req.validated = req.validated || {};
  req.validated[source] = parsed.data;

  return next();
};
