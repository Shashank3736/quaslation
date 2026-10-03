import { relations } from "drizzle-orm/relations";
import { novel, volume, richText, chapter, comment, user, tag, novelTag } from "./schema";

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
	comments: many(comment),
	novelTags: many(novelTag),
	tags: many(tag, { relationName: "novelToTag" }),
}));

export const tagRelations = relations(tag, ({many}) => ({
	novelTags: many(novelTag),
	novels: many(novel, { relationName: "novelToTag" }),
}));

export const novelTagRelations = relations(novelTag, ({one}) => ({
	novel: one(novel, {
		fields: [novelTag.novelId],
		references: [novel.id]
	}),
	tag: one(tag, {
		fields: [novelTag.tagId],
		references: [tag.id]
	}),
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
export const userRelations = relations(user, ({many}) => ({
	comments: many(comment),
}));

export const commentRelations = relations(comment, ({one}) => ({
	novel: one(novel, {
		fields: [comment.novelId],
		references: [novel.id]
	}),
	user: one(user, {
		fields: [comment.userId],
		references: [user.clerkId]
	}),
}));