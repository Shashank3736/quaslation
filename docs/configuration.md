# Configuration

This document explains the configuration of the Quaslation project.

## Environment Variables

The project uses environment variables for configuration. A template for the required environment variables can be found in [`.env.example`](../.env.example:1).

- `DIRECT_URL`: The direct connection URL for the PostgreSQL database.
- `POSTGRES_URL`: The connection URL for the PostgreSQL database.
- `POSTGRES_PRISMA_URL`: The Prisma-specific connection URL for the PostgreSQL database.
- `POSTGRES_URL_NON_POOLING`: The non-pooling connection URL for the PostgreSQL database.
- `POSTGRES_USER`: The username for the PostgreSQL database.
- `POSTGRES_HOST`: The host of the PostgreSQL database.
- `POSTGRES_PASSWORD`: The password for the PostgreSQL database.
- `POSTGRES_DATABASE`: The name of the PostgreSQL database.

## Next.js Configuration

The Next.js configuration is located in [`next.config.mjs`](../next.config.mjs:1). It includes settings for page extensions, MDX support, and remote image patterns.

## Drizzle ORM Configuration

The Drizzle ORM configuration is in [`drizzle.config.ts`](../drizzle.config.ts:1). It specifies the location of the database schema and the output directory for the generated client.

## Project Configuration

General project configuration can be found in [`src/lib/config.ts`](../src/lib/config.ts:1). This file includes constants such as the Discord invite URL and the main host URL.