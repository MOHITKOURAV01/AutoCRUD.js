# AutoCRUD.js Backend

AutoCRUD.js is a configuration-driven backend framework built with Node.js. It automates the creation of RESTful APIs by generating database models, controllers, and routes dynamically from a YAML configuration file.

## Features
- Dynamic CRUD generation from YAML
- Built-in validation using Joi
- Security middleware with Helmet and Rate Limiting
- MongoDB connectivity via Mongoose
- ES Modules (ESM) support

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance

## Setup
1. Clone the repository
2. `cd backend`
3. `pnpm install`
4. `cp .env.example .env` and fill in your details
5. `npm run dev`

## Configuration
Define your entities in `src/config/sample.config.yaml`.

## License
ISC
