import { pgTable, varchar, timestamp, text, integer, uniqueIndex, foreignKey, serial, doublePrecision, index, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const role = pgEnum("Role", ['ADMIN', 'SUBSCRIBER', 'MEMBER'])

export const prismaMigrations = pgTable("_prisma_migrations", {
	id: varchar("id", { length: 36 }).primaryKey().notNull(),
	checksum: varchar("checksum", { length: 64 }).notNull(),
	finishedAt: timestamp("finished_at", { withTimezone: true, mode: 'string' }),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text("logs"),
	rolledBackAt: timestamp("rolled_back_at", { withTimezone: true, mode: 'string' }),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const volume = pgTable("Volume", {
	id: serial("id").primaryKey().notNull(),
	createdAt: timestamp("createdAt", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	publishedAt: timestamp("publishedAt", { precision: 3 }),
	updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
	number: doublePrecision("number").notNull(),
	title: text("title"),
	novelId: integer("novelId").notNull(),
},
(table) => {
	return {
		novelIdNumberKey: uniqueIndex("Volume_novelId_number_key").using("btree", table.novelId.asc().nullsLast(), table.number.asc().nullsLast()),
		volumeNovelIdFkey: foreignKey({
			columns: [table.novelId],
			foreignColumns: [novel.id],
			name: "Volume_novelId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const user = pgTable("User", {
	clerkId: text("clerkId").primaryKey().notNull(),
	role: role("role").default('MEMBER').notNull(),
});

export const richText = pgTable("RichText", {
	id: serial("id").primaryKey().notNull(),
	text: text("text").notNull(),
	html: text("html").notNull(),
	markdown: text("markdown").notNull(),
});

export const novel = pgTable("Novel", {
	id: serial("id").primaryKey().notNull(),
	slug: text("slug").notNull(),
	title: text("title").notNull(),
	thumbnail: text("thumbnail"),
	createdAt: timestamp("createdAt", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	publishedAt: timestamp("publishedAt", { precision: 3 }),
	updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
	richTextId: integer("richTextId").notNull(),
},
(table) => {
	return {
		richTextIdKey: uniqueIndex("Novel_richTextId_key").using("btree", table.richTextId.asc().nullsLast()),
		slugKey: uniqueIndex("Novel_slug_key").using("btree", table.slug.asc().nullsLast()),
		titleKey: uniqueIndex("Novel_title_key").using("btree", table.title.asc().nullsLast()),
		novelRichTextIdFkey: foreignKey({
			columns: [table.richTextId],
			foreignColumns: [richText.id],
			name: "Novel_richTextId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const chapter = pgTable("Chapter", {
	id: serial("id").primaryKey().notNull(),
	premium: boolean("premium").default(true).notNull(),
	slug: text("slug").notNull(),
	novelId: integer("novelId").notNull(),
	volumeId: integer("volumeId").notNull(),
	serial: integer("serial").notNull(),
	number: doublePrecision("number").notNull(),
	title: text("title").notNull(),
	createdAt: timestamp("createdAt", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	publishedAt: timestamp("publishedAt", { precision: 3 }),
	updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
	richTextId: integer("richTextId").notNull(),
},
(table) => {
	return {
		novelIdSerialKey: uniqueIndex("Chapter_novelId_serial_key").using("btree", table.novelId.asc().nullsLast(), table.serial.asc().nullsLast()),
		premiumIdx: index("Chapter_premium_idx").using("btree", table.premium.asc().nullsLast()),
		serialIdx: index("Chapter_serial_idx").using("btree", table.serial.asc().nullsLast()),
		publishedAtIdx: index("Chapter_publishedAt_idx").using("btree", table.publishedAt.asc().nullsLast()),
		richTextIdKey: uniqueIndex("Chapter_richTextId_key").using("btree", table.richTextId.asc().nullsLast()),
		slugKey: uniqueIndex("Chapter_slug_key").using("btree", table.slug.asc().nullsLast()),
		volumeIdNumberKey: uniqueIndex("Chapter_volumeId_number_key").using("btree", table.volumeId.asc().nullsLast(), table.number.asc().nullsLast()),
		chapterNovelIdFkey: foreignKey({
			columns: [table.novelId],
			foreignColumns: [novel.id],
			name: "Chapter_novelId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		chapterRichTextIdFkey: foreignKey({
			columns: [table.richTextId],
			foreignColumns: [richText.id],
			name: "Chapter_richTextId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
		chapterVolumeIdFkey: foreignKey({
			columns: [table.volumeId],
			foreignColumns: [volume.id],
			name: "Chapter_volumeId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const comment = pgTable("Comment", {
	id: serial("id").primaryKey().notNull(),
	content: text("content").notNull(),
	createdAt: timestamp("createdAt", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
	isHidden: boolean("isHidden").default(false).notNull(),
	isEdited: boolean("isEdited").default(false).notNull(),
	novelId: integer("novelId").notNull(),
	userId: text("userId").notNull(),
},
(table) => {
	return {
		novelIdIdx: index("Comment_novelId_idx").using("btree", table.novelId.asc().nullsLast()),
		userIdIdx: index("Comment_userId_idx").using("btree", table.userId.asc().nullsLast()),
		createdAtIdx: index("Comment_createdAt_idx").using("btree", table.createdAt.desc().nullsLast()),
		commentNovelIdFkey: foreignKey({
			columns: [table.novelId],
			foreignColumns: [novel.id],
			name: "Comment_novelId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		commentUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.clerkId],
			name: "Comment_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});
