# Dependencies

This document lists the key dependencies of the Quaslation project. The full list of dependencies can be found in [`package.json`](../package.json:1).

## Core Dependencies

- **next**: The React framework for production.
- **react**: A JavaScript library for building user interfaces.
- **react-dom**: Serves as the entry point to the DOM and server renderers for React.
- **typescript**: A typed superset of JavaScript that compiles to plain JavaScript.

## Authentication

- **@clerk/nextjs**: Provides Clerk authentication for Next.js applications.

## Database

- **drizzle-orm**: A TypeScript ORM for SQL databases.
- **postgres**: A PostgreSQL client for Node.js.
- **@vercel/postgres**: A PostgreSQL client for Vercel Functions.

## Styling

- **tailwindcss**: A utility-first CSS framework for rapidly building custom designs.
- **@radix-ui/react-***: A collection of unstyled, accessible UI components.
- **lucide-react**: A library of simply designed icons.

## Content

- **@mdx-js/loader**: A webpack loader for MDX.
- **@mdx-js/react**: The React context for MDX.
- **@next/mdx**: The official Next.js plugin for MDX.
- **html-react-parser**: A library for converting an HTML string to one or more React elements.

## Development Dependencies

- **drizzle-kit**: A CLI tool for Drizzle ORM.
- **eslint**: A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
- **postcss**: A tool for transforming CSS with JavaScript.
- **dotenv**: A zero-dependency module that loads environment variables from a `.env` file into `process.env`.