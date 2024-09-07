import { relations } from "drizzle-orm/relations";
import { novel, volume, richText, chapter } from "./schema";

export const volumeRelations = relations(volume, ({one, many}) => ({
	novel: one(novel, {
		fields: [volume.novelId],
		references: [novel.id]
	}),
	chapters: many(chapter),
}));

export const novelRelations = relations(novel, ({one, many}) => ({
	volumes: many(volume),
	richText: one(richText, {
		fields: [novel.richTextId],
		references: [richText.id]
	}),
	chapters: many(chapter),
}));

export const richTextRelations = relations(richText, ({many}) => ({
	novels: many(novel),
	chapters: many(chapter),
}));

export const chapterRelations = relations(chapter, ({one}) => ({
	novel: one(novel, {
		fields: [chapter.novelId],
		references: [novel.id]
	}),
	richText: one(richText, {
		fields: [chapter.richTextId],
		references: [richText.id]
	}),
	volume: one(volume, {
		fields: [chapter.volumeId],
		references: [volume.id]
	}),
}));