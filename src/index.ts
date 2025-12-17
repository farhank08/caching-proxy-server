import { Command } from 'commander';
import http from 'http';
import * as Redis from './services/redis';
import { startServer, clearCache, closeCache } from './server';

// Express server instance
let server: http.Server;

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

// Create a new Command program
const program: Command = new Command();

// Define program
program
	.name('caching-proxy-server')
	.description('A caching proxy server using redis for caching responses.')
	.version('1.0.0');

program.command('test').action(() => {
	console.log('Test command executed');
});

// Start proxy server using options
program
	.command('start')
	.description('Run a proxy server on a specified port with a given origin server URL.')
	.option('-p, --port <number>', 'Port to run the server on', '3000')
	.requiredOption('-o, --origin <origin>', 'Origin server URL')
	.action((options: { port: string; origin: string }) => {
		// Deconstruct options
		const { port, origin } = options;
		const portNumber: number = Number(port);

		// Validate and parse port
		if (!Number.isInteger(portNumber)) {
			console.error('Port must be a valid number');
			process.exit(1);
		}

		// Validate origin URL
		if (!/^https?:\/\/.+/.test(origin)) {
			console.error('Origin must be a valid URL starting with http:// or https://');
			process.exit(1);
		}

		// Start the server
		server = startServer(portNumber, origin);
	});

// Clear cache on proxy server
program
	.command('clear-cache')
	.description('Clear the cache stored in Redis.')
	.action(async () => {
		// Logic to clear the cache goes here
		clearCache();
	});

// Shut down server gracefully
const shutdown = async () => {
	// Close the cache client
	closeCache();
	console.log(`Cache shutdown successful`);

	// Close the server
	if (server) {
		server.close(async (error: Error | undefined) => {
			if (error) {
				// Exit with error
				console.error(`Server shutdown error: ${error.message}`);
				process.exit(1);
			}

			// Exit with success
			console.log(`Server shutdown successful`);
			process.exit(0);
		});
	}
};

// Assign callback for shutdown
process.on('SIGINT', shutdown);

// Parse command line arguments
program.parse(process.argv);
