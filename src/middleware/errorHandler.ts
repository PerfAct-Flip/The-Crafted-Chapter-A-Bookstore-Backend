import type { NextFunction, Request, Response } from "express";
import type { ApiError } from "../types/common";
import { error } from "../utils/response";

/**
 * Central error handler — anything passed to next(e) lands here.
 *
 * Known errors (an `err.status` set by a service/controller) keep their
 * status and message. Everything else is treated as an unexpected failure:
 * the real message is logged server-side and the client only gets a generic
 * 500, so Prisma/stack details never leak in the response.
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status ?? 500;
  const code = (err as { code?: string }).code;

  if (status >= 500) {
    // Log unexpected failures (Prisma errors, TypeError, ...) with context.
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
      err,
    );
  }

  return error(
    res,
    code ?? (status >= 500 ? "SERVER_ERROR" : "BAD_REQUEST"),
    status >= 500 ? "Internal server error" : err.message,
    err.errors ?? {},
    status,
  );
};

export default errorHandler;
