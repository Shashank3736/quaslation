# Architecture

This document outlines the architecture of the Quaslation project.

## Overview

The project is a [Next.js](https://nextjs.org/) application built with TypeScript. It uses a monolithic architecture with a clear separation of concerns between the frontend and backend.

## Frameworks and Libraries

- **Next.js:** The core framework for the application, providing server-side rendering, static site generation, and a file-based routing system.
- **React:** The library for building the user interface.
- **Drizzle ORM:** Used for interacting with the PostgreSQL database, providing a type-safe query builder.
- **Clerk:** For user authentication and management.
- **Tailwind CSS:** For styling the application.
- **MDX:** For writing content pages that can include React components.

## Directory Structure

The project follows a standard Next.js directory structure:

- **`src/app`**: Contains the application's routes and pages.
  - **`(main)`**: The main application layout and pages.
  - **`admin`**: The admin dashboard.
  - **`api`**: API routes.
- **`src/components`**: Reusable React components.
- **`src/lib`**: Contains utility functions, database configuration, and other shared code.
  - **`db`**: Contains the Drizzle ORM schema, queries, and configuration.
- **`public`**: Static assets like images and fonts.