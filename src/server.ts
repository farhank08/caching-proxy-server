import express, { Express, Request, Response, NextFunction } from 'express';
import http from 'http';
import cacheMiddleware from './middlewares/cacheMiddleware';
import proxyMiddleware from './middlewares/proxyMiddleware';
import { globalErrorHandler } from './utils/errorHandler';
import * as Redis from './services/redis';

// Start server
export const startServer = (port: number, origin: string): http.Server => {
	try {
		// Create redis cache client
		Redis.initCache();
	} catch (error: unknown) {
		// Default error message
		let message: string = 'UNHANDLED ERROR';

		// Get message from error if error: Error
		if (error instanceof Error) {
			message = error.message;
		}

		// Exit process on error
		console.error(`Redis client initilization error: ${message}`);
		process.exit(1);
	}

	// Create Express app
	const app: Express = express();

	// Handle automatic favicon GET request
	app.get('/favicon.ico', (req: Request, res: Response) => {
		return res.status(204).end();
	});

	// Use caching middleware for GET requests
	app.use(cacheMiddleware(origin));

	// Use non-GET request forward to origin middleware
	app.use(proxyMiddleware(origin));

	// Global error handler
	app.use(globalErrorHandler);

	// Start listening on port
	const server: http.Server = app.listen(port, () => {
		console.log(`Proxy server is running on port ${port}`);
	});

	// Return server instance
	return server;
};

// Clear redis cache
export const clearCache = async (): Promise<void> => {
	await Redis.clearCache();
};

// Close redis client
export const closeCache = () => {
	Redis.closeCache();
};
