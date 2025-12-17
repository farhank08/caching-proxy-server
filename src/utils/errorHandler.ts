import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

// Global error handler
export const globalErrorHandler = (error: unknown, req: Request, res: Response) => {
	console.error(`Unhandler proxy error: ${error}`);
	res.status(500).json({
		error: 'Internal proxy error',
	});
};
