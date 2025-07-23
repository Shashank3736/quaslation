# Database

This document describes the database schema for the Quaslation project.

## ORM

The project uses [Drizzle ORM](https://orm.drizzle.team/) to interact with the PostgreSQL database. The schema is defined in [`src/lib/db/schema.ts`](../src/lib/db/schema.ts:1).

## Tables

### `user`

Stores user information.

| Column | Type | Description |
| --- | --- | --- |
| `clerkId` | `text` | The user's ID from Clerk. Primary Key. |
| `role` | `role` | The user's role. Can be `ADMIN`, `SUBSCRIBER`, or `MEMBER`. |

### `novel`

Stores information about the novels.

| Column | Type | Description |
| --- | --- | --- |
| `id` | `serial` | The unique ID of the novel. Primary Key. |
| `slug` | `text` | The URL-friendly slug for the novel. |
| `title` | `text` | The title of the novel. |
| `thumbnail` | `text` | The URL of the novel's thumbnail image. |
| `createdAt` | `timestamp` | The date and time the novel was created. |
| `publishedAt` | `timestamp` | The date and time the novel was published. |
| `updatedAt` | `timestamp` | The date and time the novel was last updated. |
| `richTextId` | `integer` | Foreign key to the `richText` table for the novel's description. |

### `volume`

Stores information about the volumes of a novel.

| Column | Type | Description |
| --- | --- | --- |
| `id` | `serial` | The unique ID of the volume. Primary Key. |
| `createdAt` | `timestamp` | The date and time the volume was created. |
| `publishedAt` | `timestamp` | The date and time the volume was published. |
| `updatedAt` | `timestamp` | The date and time the volume was last updated. |
| `number` | `doublePrecision` | The volume number. |
| `title` | `text` | The title of the volume. |
| `novelId` | `integer` | Foreign key to the `novel` table. |

### `chapter`

Stores information about the chapters of a novel.

| Column | Type | Description |
| --- | --- | --- |
| `id` | `serial` | The unique ID of the chapter. Primary Key. |
| `premium` | `boolean` | Whether the chapter is a premium chapter. |
| `slug` | `text` | The URL-friendly slug for the chapter. |
| `novelId` | `integer` | Foreign key to the `novel` table. |
| `volumeId` | `integer` | Foreign key to the `volume` table. |
| `serial` | `integer` | The serial number of the chapter within the novel. |
| `number` | `doublePrecision` | The chapter number within the volume. |
| `title` | `text` | The title of the chapter. |
| `createdAt` | `timestamp` | The date and time the chapter was created. |
| `publishedAt` | `timestamp` | The date and time the chapter was published. |
| `updatedAt` | `timestamp` | The date and time the chapter was last updated. |
| `richTextId` | `integer` | Foreign key to the `richText` table for the chapter's content. |

### `richText`

Stores rich text content.

| Column | Type | Description |
| --- | --- | --- |
| `id` | `serial` | The unique ID of the rich text content. Primary Key. |
| `text` | `text` | The plain text content. |
| `html` | `text` | The HTML representation of the content. |
| `markdown` | `text` | The Markdown representation of the content. |

### `prismaMigrations`

Used by Prisma to track database migrations.