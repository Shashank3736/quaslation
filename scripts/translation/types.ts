export interface RichTextPayload {
  text: string;
  html: string;
  markdown: string;
}

export interface VolumeMeta {
  number: number; // 1-based volume number
  title: string;
  chapters?: number;
  file?: string; // volume-XXX.json
}

export interface IndexJson {
  workUrl: string;
  workId: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  synopsis: RichTextPayload;
  volumes: VolumeMeta[];
  totalChapters: number;
  generatedAt: string; // ISO
}

export interface ChapterSourceRef {
  url: string;
  episodeId: string;
}

export interface ChapterEntry {
  premium: boolean;
  slug: string; // stable, e.g. episode-<id>
  serial: number; // global order across all volumes
  number: number; // per-volume index starting at 1
  title: string;
  createdAt: string; // ISO
  publishedAt: string; // ISO
  updatedAt: string; // ISO
  richText: RichTextPayload;
  source: ChapterSourceRef;
}

export interface VolumeJson {
  workId: string;
  volume: {
    number: number;
    title: string;
  };
  chapters: ChapterEntry[];
}