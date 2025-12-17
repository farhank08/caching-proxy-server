import axios, { AxiosResponse } from 'axios';
import { Request, Response, NextFunction } from 'express';

export default (origin: string) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		// Origin url with request url
		const url: string = `${origin}${req.url}`;

		// Header options to be filtered
		const hopByHopHeaders = new Set([
			'connection',
			'keep-alive',
			'proxy-authenticate',
			'proxy-authorization',
			'te',
			'trailer',
			'transfer-encoding',
			'upgrade',
			'content-length',
		]);

		// Filter and remove hop-by-hop headers from request header
		const filteredHeaders = Object.fromEntries(
			Object.entries(req.headers).filter(([key]) => !hopByHopHeaders.has(key.toLowerCase()))
		);

		try {
			// Forward request to origin
			const originRes: AxiosResponse = await axios.request({
				method: req.method,
				url,
				headers: {
					...filteredHeaders,
					host: undefined, // Remove host and let axios compute
				},
				data: req.body,
				responseType: 'arraybuffer',
				validateStatus: () => true, // Treat all HTTP status codes as valid responses for forwarding to origin
			});

			// Set cookies from origin in response header
			const setCookie: string[] | undefined = originRes.headers['set-cookie'];
			if (setCookie) {
				res.setHeader('Set-Cookie', setCookie);
			}

			// Forward origin response
			console.log(
				`${req.method} ${req.url} request forwarded to ${origin} on ${new Date().toLocaleString()}`
			);
			return res.status(originRes.status).send(originRes.data);
		} catch (error: unknown) {
			// Log error
			console.error(
				`${req.method} ${req.url} request failed at ${origin} on ${new Date().toLocaleString()}`
			);

			// Handle Axios error
			if (axios.isAxiosError(error)) {
				// Add axios error message
				console.error(error.message);

				// Gateway error
				if (!error.response) {
					return res.status(502).json({
						success: false,
						message: 'Bad Gateway',
					});
				}

				// Origin error
				return res.status(error.response.status).json({
					success: false,
					message: error.message,
				});
			}

			// Reroute to global error handler
			next(error);
		}
	};
};
