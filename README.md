# quaslation

![Version](https://img.shields.io/badge/version-2.14.1-blue)

A website for sharing translated novels. This project is intended as a "source available" portfolio piece for educational and demonstration purposes.

## ⚠️ License & Usage

This project is **source available**, but it is **not open-source**. You may view the code for educational purposes. However, you must obtain explicit permission before you can reuse, modify, or distribute any part of this codebase.

For inquiries, please contact me.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Setup and Deployment](#setup-and-deployment)
- [API and CLI](#api-and-cli)
- [Testing](#testing)
- [Contributing](#contributing)

## Project Overview

`quaslation` is a monolithic web application for sharing translated novels. It is built with a focus on performance and scalability, leveraging modern web technologies. The primary goal of this project is to serve as a portfolio piece demonstrating a comprehensive understanding of full-stack development with Next.js.

## Architecture

The application is a **monolithic application** built with the **Next.js App Router**. It emphasizes a scalable design and leverages modern Next.js features for performance and maintainability.

-   **Key Design Patterns**:
    -   **Server-Side Rendering (SSR)**, **Server Components**, and the **Edge Runtime** are used extensively to optimize performance.
    -   Backend operations are handled via **Next.js Server Actions**, which are co-located with their corresponding components. This approach avoids the need for a traditional REST or GraphQL API for internal operations.
    -   The UI is built with **React** and styled using the utility-first **Tailwind CSS** framework.
-   **Data Flow**: Data is fetched on the server side using the **Drizzle ORM** and passed down to components as props. Server Actions are used to manage data mutations securely and efficiently.
-   **Architectural Documents**: A detailed architectural plan for the translation CLI feature can be found in [`scripts/translation/plan.md`](scripts/translation/plan.md).

## Technology Stack

### Languages

-   TypeScript

### Frameworks & Libraries

| Library | Version | Purpose |
| :--- | :--- | :--- |
| Next.js | `15.4.3` | Full-stack web framework |
| React | `19.1.0` | UI library |
| Tailwind CSS | `3.4.1` | CSS framework |
| Drizzle ORM | `0.44.3` | TypeScript ORM |
| Clerk | `6.30.0` | Authentication |
| MDX | `3.0.1` | Content as components |
| Radix UI | | UI Components |
| `react-hook-form` | `7.53.0` | Form management |
| `zod` | `3.23.8` | Schema validation |

### Databases

-   PostgreSQL
-   Vercel KV
-   Vercel Postgres

### Development Tools

-   ESLint
-   `tsx`

## Features

-   **Admin Panel**: A secure panel for content management, located at [`src/app/admin/`](src/app/admin/).
-   **Content Management**: Novels, chapters, and volumes are managed via the admin panel. MDX is used for rich content pages, located at [`src/app/(main)/(mdx)/`](src/app/(main)/(mdx)/).
-   **User Authentication**: Handled by Clerk, with UI components in [`src/app/auth/`](src/app/auth/).
-   **Translation CLI**: A set of scripts for fetching, translating, and managing novel content. These can be found in [`scripts/translation/`](scripts/translation/) and [`scripts/gemini/`](scripts/gemini/).
-   **SEO & Syndication**: Includes automatic sitemap generation ([`src/app/sitemap.ts`](src/app/sitemap.ts)) and RSS feeds ([`src/app/rss.xml/route.ts`](src/app/rss.xml/route.ts)).
-   **UI/UX**: Supports dark mode ([`src/components/system/dark-mode-button.tsx`](src/components/system/dark-mode-button.tsx)) and uses a theme provider for consistent styling.

## Setup and Deployment

### Local Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env.local` file by copying the example file:
    ```bash
    cp env.example .env.local
    ```
    Populate the `.env.local` file with the necessary environment variables.

3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    This command starts the development server with Turbopack.

### Database

The project uses Drizzle ORM for database schema management. The following scripts are available:

-   `npm run db:migrate`: Run database migrations.
-   `npm run db:push`: Push schema changes to the database.

### Deployment

The project is configured for deployment on Vercel. There is no CI/CD pipeline defined in the `.github` directory.

## API and CLI

### API

The application does not expose a traditional web API. Instead, it uses **Next.js Server Actions** for client-server communication. A public-facing RSS feed is available for syndication.

### CLI

Several scripts are provided for development and content management:

-   `db:*`: A set of scripts for managing database migrations.
-   `fetch:kakuyomu`: A script for fetching novel data.
-   The `scripts` directory contains complex CLI tools for content processing.

## Testing

There is **no formal testing strategy** for this project. The project does not include any testing frameworks, test files, or `test` scripts in [`package.json`](package.json). Quality is maintained through manual testing and the static type checking provided by TypeScript.

## Contributing

This project is "source available," and contributions are not accepted at this time. The code style is enforced by ESLint, with the configuration located in [`.eslintrc.json`](.eslintrc.json).
