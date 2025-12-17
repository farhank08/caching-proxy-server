import dotenv from 'dotenv';
import { createClient, RedisClientType } from 'redis';

// Load environment variables
dotenv.config();

// Expiration timer (in seconds)
const CACHE_TTL = 300;

// Redis client instance
let client: RedisClientType;

// Initialize cache client instance
export const initCache = async () => {
	// Create redis client
	client = createClient({
		url: process.env.REDIS_HOST,
	});

	// Connect to cache
	await client.connect();

	// Handle create client failed error
	client.on('error', (error: unknown) => {
		// Default error message
		let message: string = 'UNHANDLED ERROR';

		// Get message from error if error: Error
		if (error instanceof Error) {
			message = error.message;
		}

		// Handle client create error
		console.error(`Reddis client creation error: ${message}`);
	});
};

// Get cache
export const getCache = async <T>(key: string): Promise<T | null> => {
	// Get data from cache
	const cachedData: string | null = await client.get(key);

	// Return data
	return cachedData ? (JSON.parse(cachedData) as T) : null;
};

// Set cache
export const setCache = async <T>(key: string, value: unknown): Promise<void> => {
	// Set data in cache
	await client.set(key, JSON.stringify(value), {
		EX: CACHE_TTL,
	});
};

// Clear cache data
export const clearCache = async (): Promise<void> => {
	// Flush cache
	await client.flushAll();
};

// Destroy client
export const closeCache = () => {
	client.destroy();
};
