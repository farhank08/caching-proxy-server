import axios, { AxiosResponse } from 'axios';
import { Request, Response, NextFunction } from 'express';

export default (origin: string) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		// Origin url with request url
		const url: string = `${origin}${req.url}`;

		// Forward origin response
		console.log(
			`${req.method} ${req.url} request forwarded to ${origin} on ${new Date().toLocaleString()}`
		);
		return res.status(302).redirect(url);
	};
};
