<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Waste Pro (Backend)

Waste Pro is a SaaS (Software as a Service) backend that powers waste management operations and services. Built using [NestJS](https://nestjs.com/) and TypeScript, it provides secure, scalable RESTful APIs supporting frontend applications for authentication, billing, analytics, and access control in the waste management domain.

## Features

- Modular NestJS architecture for clean code organization
- Secure JWT-based authentication & route protection
- Database connection via TypeORM (configure via environment)
- Input validation and security middleware (Helmet, CORS)
- Central logging and flexible environment-based configs
- Separated modules for authentication, billing, and shared utilities
- `/v1/health` endpoint for health checks

## Prerequisites
- Node.js (v14.19, v16, or v18)
- Yarn or npm
- Database instance (connection set in environment variables)

## Installation

```bash
yarn install
# or
npm install
```

## Configuration

Create a `.env` file in the project root. Typical variables include:
- Database connection string and options
- JWT secret & expiry
- Application environment details
- (Optional) AWS/service credentials

Reference the files in `src/config/envs/` for supported configuration schema.

## Running the app

```bash
# development
yarn start
# or
npm run start

# watch mode
yarn start:dev
# or
npm run start:dev

# production mode
yarn start:prod
# or
npm run start:prod
```

By default, the backend listens on port 3000 (or as defined in env vars). All API routes are prefixed with `/v1`.

### API Example
- Health endpoint: `GET /v1/health` (responds with `Hello, doing great!`)

## Testing

```bash
# unit tests
yarn test
# or
npm run test

# e2e tests
yarn test:e2e
# or
npm run test:e2e

# test coverage
yarn test:cov
# or
npm run test:cov
```

## Deployment
- Build and serve using Node.js (optionally use PM2 or similar tools)
- Integrate with your SPA build if needed (see client/frontend docs)

## License

Waste Pro backend is open source and MIT licensed.
