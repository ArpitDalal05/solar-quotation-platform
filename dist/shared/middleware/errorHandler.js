"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
// Central error handler to keep responses consistent
// and ensure non-leaky error details in production.
// Non-Functional: supports fast, predictable error responses.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, _req, res, _next) {
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
