import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

// Global error handler
export const globalErrorHandler = (error: unknown, req: Request, res: Response) => {
	// Default error message
	let message = 'UNHANDLED_ERROR';

	// Get message from Error class
	if (error instanceof Error) {
		message = error.message;
	}

	// Respond with proxy error
	console.error(`Unhandled proxy error ${message}`);
	res.status(500).json({
		error: 'Internal proxy error',
	});
};
