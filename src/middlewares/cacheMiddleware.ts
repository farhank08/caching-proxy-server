import axios, { AxiosResponse } from 'axios';
import { Request, Response, NextFunction } from 'express';
import * as Redis from '../services/redis';

// Middleware to retrieve data from cache if available
export default (origin: string) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		// Reroute to proxy middleware for non-GET requests
		if (req.method !== 'GET') return next();

		// Origin url with request url
		const url: string = `${origin}${req.url}`;

		// Initialize cache key
		const cacheKey: string = `${req.method}:${url}`;

		// Find cached data
		const cachedResponse: { status: number; body: unknown | null } | null = await Redis.getCache(
			cacheKey
		);

		// Send found data
		if (cachedResponse) {
			// Set X-Cache response header
			res.set('X-Cache', 'HIT');

			// Return cached data as response
			console.log(
				`[CACHE] ${req.method} ${req.url} request successful on ${new Date().toLocaleString()}`
			);
			return res.status(cachedResponse.status).send(cachedResponse.body);
		}

		try {
			// Send request to origin server
			const originRes: AxiosResponse = await axios.get(url, {
				headers: {
					...req.headers,
					host: undefined,
				},
				data: req.body ? req.body : null,
			});

			// Set data in cache
			await Redis.setCache(cacheKey, {
				status: originRes.status,
				body: originRes.data ? originRes.data : null,
			});

			// Return origin data as response
			res.set('X-Cache', 'MISS');
			console.log(
				`[ORIGIN] ${req.method} ${req.url} request successful on ${new Date().toLocaleString()}`
			);
			return res.status(originRes.status).send(originRes.data);
		} catch (error: unknown) {
			// Log error
			console.error(
				`${req.method} ${
					req.url
				} request failed to fetch data from ${origin} on ${new Date().toLocaleString()}`
			);

			// Add error message to log
			if (axios.isAxiosError(error) || error instanceof Error) {
				console.error(error.message);
			}

			// Respond with failure
			return res.status(500).json({
				success: false,
				message: 'Error fetching data from origin server',
			});
		}
	};
};
