# Caching Proxy Server

A Node.js **caching proxy server** built with **TypeScript** that sits in front of a third‑party API and caches responses in **Redis** to improve performance and reduce upstream API calls. The server exposes a CLI for starting the proxy and clearing the cache.

Credit https://roadmap.sh/projects/caching-server

## Prerequisites

- Node.js
- Redis server (local, Docker, or managed cloud service)
- Docker (optional, for running Redis locally)

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd caching-proxy-server
```

### Install dependencies

```bash
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
REDIS_HOST=redis-connection-url
```

**IMPORTANT** The redis host must be a connection url (local, docker or cloud) - See below for docker instructions

## Running the Application

### Development mode

Runs the TypeScript source directly with hot reload:

```bash
npm run dev
```

### Production build

Compile TypeScript and start the server:

```bash
npm start
```

This will:

1. Compile TypeScript into `dist/`
2. Execute the compiled index (`dist/index.js`)

### Start the proxy server

```bash
npm start -- start-proxy --port <port> --origin <origin-url>
```

**Options**

- `--port` – Local port to run the proxy server on
- `--origin` – Base URL of the upstream API to proxy and cache

### Clear cache

```bash
npm start -- clear-cache
```

This command flushes all cached data from Redis.

## How It Works

1. Incoming requests are intercepted by the proxy middleware
2. The cache middleware checks Redis for a cached response
3. If a cache hit occurs, the cached response is returned
4. On a cache miss, the request is forwarded to the origin API
5. The response is cached in Redis using the configured TTL

## Running Redis with Docker (Optional)

If you don’t have Redis installed locally, you can run it using Docker Compose.

This will start a Redis instance on `redis://localhost:6379`.

```bash
docker compose up -d
```

To check current containers, you can run

```bash
docker ps
```

To stop the Docker Compose container, you can run

```bash
docker compose down
```

## Notes

- The cache is **shared** across all requests and routes
- Clearing the cache flushes all Redis keys
- Designed to be API‑agnostic and reusable for different upstream services

## License

This project is licensed under the ISC License.
