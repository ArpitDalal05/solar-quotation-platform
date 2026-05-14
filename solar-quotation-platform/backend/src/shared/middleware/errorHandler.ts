import { NextFunction, Request, Response } from "express";

// Central error handler to keep responses consistent
// and ensure non-leaky error details in production.
// Non-Functional: supports fast, predictable error responses.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Basic structured logging
  // eslint-disable-next-line no-console
  console.error("Unhandled error", err);

  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  return res.status(500).json({ message: "Internal Server Error" });
}

