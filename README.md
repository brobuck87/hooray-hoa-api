# Hooray HOA API

![Build](https://github.com/brobuck87/hooray-hoa-api/actions/workflows/build.yml/badge.svg)
[![codecov](https://codecov.io/github/brobuck87/hooray-hoa-api/graph/badge.svg?token=0HVSE9N0JV)](https://codecov.io/github/brobuck87/hooray-hoa-api)

## Overview

Empowering HOAs with innovative, user-friendly technology to enhance community management, transparency, and engagement.

## Features

- **RESTful API**: Provides endpoints for CRUD operations on various resources.
- **Authentication**: Implements authentication using JWT tokens.
- **Error Handling**: Centralized error handling and logging.
- **Middleware**: Includes middleware for request parsing, CORS, etc.
- **Database Integration**: Connects to a database (PostgreSQL) for data storage.
- **Environment Variables**: Uses environment variables for configuration.
- **Testing**: Basic testing setup using Jest and/or Supertest.
- **Logging**: Utilizes logging libraries (e.g., Winston) for debugging and monitoring.
- **Security**: Includes basic security practices like input validation and sanitization.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/en/download/package-manager)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/download/) installed and running
- Environment variables set up (see `.env.example`)

## Getting Started

To get a local copy up and running, follow these simple steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/brobuck87/hooray-hoa-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   
   - Rename `.env.example` to `.env`
   - Update `.env` with your environment-specific variables

4. Start the server:

   ```bash
   npm run start:dev
   ```

5. The server should now be running at `http://localhost:3000`.
