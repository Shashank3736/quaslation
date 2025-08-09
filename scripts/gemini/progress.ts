import * as fs from 'fs/promises';
import * as path from 'path';

export interface ProgressData {
  novelId: number;
  volumeNumber: number;
  lastUpdated: string;
  chapters: {
    [url: string]: {
      status: 'pending' | 'completed' | 'failed';
      chapterNumber?: number;
      translatedAt?: string;
      error?: string;
      filePath?: string;
    };
  };
}

export interface ChapterProgress {
  url: string;
  status: 'pending' | 'completed' | 'failed';
  chapterNumber?: number;
  translatedAt?: string;
  error?: string;
  filePath?: string;
}

export class ProgressTracker {
  private progressDir: string;
  private progressFile: string;

  constructor(novelId: number, volumeNumber: number, baseDir: string = './scripts/output/gemini') {
    this.progressDir = path.join(baseDir, `novel-${novelId}`, `volume-${volumeNumber}`);
    this.progressFile = path.join(this.progressDir, '.progress.json');
  }

  async initialize(): Promise<ProgressData> {
    try {
      await fs.mkdir(this.progressDir, { recursive: true });
      const existingData = await this.load();
      if (existingData) {
        return existingData;
      }
    } catch (error) {
      console.warn('Could not initialize progress directory:', error);
    }
    
    return {
      novelId: 0, // Will be set when creating new progress
      volumeNumber: 0, // Will be set when creating new progress
      lastUpdated: new Date().toISOString(),
      chapters: {}
    };
  }

  async load(): Promise<ProgressData | null> {
    try {
      const content = await fs.readFile(this.progressFile, 'utf8');
      return JSON.parse(content) as ProgressData;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async save(progress: ProgressData): Promise<void> {
    progress.lastUpdated = new Date().toISOString();
    try {
      await fs.writeFile(this.progressFile, JSON.stringify(progress, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw error;
    }
  }

  updateChapterProgress(
    progress: ProgressData, 
    url: string, 
    chapterProgress: Partial<ChapterProgress>
  ): ProgressData {
    const currentProgress = progress.chapters[url] || {
      status: 'pending',
      chapterNumber: undefined,
      translatedAt: undefined,
      error: undefined,
      filePath: undefined
    };

    progress.chapters[url] = {
      ...currentProgress,
      ...chapterProgress
    };

    return progress;
  }

  getPendingChapters(progress: ProgressData, allUrls: string[]): string[] {
    return allUrls.filter(url => !progress.chapters[url] || progress.chapters[url].status === 'pending');
  }

  getCompletedChapters(progress: ProgressData): string[] {
    return Object.entries(progress.chapters)
      .filter(([_, data]) => data.status === 'completed')
      .map(([url, _]) => url);
  }

  getFailedChapters(progress: ProgressData): string[] {
    return Object.entries(progress.chapters)
      .filter(([_, data]) => data.status === 'failed')
      .map(([url, _]) => url);
  }

  getProgressSummary(progress: ProgressData): { total: number; completed: number; failed: number; pending: number } {
    const total = Object.keys(progress.chapters).length;
    const completed = this.getCompletedChapters(progress).length;
    const failed = this.getFailedChapters(progress).length;
    const pending = total - completed - failed;

    return { total, completed, failed, pending };
  }

  async markAsCompleted(progress: ProgressData, url: string, chapterNumber: number, filePath: string): Promise<ProgressData> {
    return this.updateChapterProgress(progress, url, {
      status: 'completed',
      chapterNumber,
      translatedAt: new Date().toISOString(),
      filePath
    });
  }

  async markAsFailed(progress: ProgressData, url: string, error: string): Promise<ProgressData> {
    return this.updateChapterProgress(progress, url, {
      status: 'failed',
      error,
      translatedAt: new Date().toISOString()
    });
  }

  async resumeFromProgress(
    novelId: number, 
    volumeNumber: number, 
    allUrls: string[]
  ): Promise<{ progress: ProgressData; urlsToProcess: string[] }> {
    const progress = await this.initialize();
    progress.novelId = novelId;
    progress.volumeNumber = volumeNumber;

    const urlsToProcess = this.getPendingChapters(progress, allUrls);
    
    // Clean up any entries that no longer exist in the URL list
    Object.keys(progress.chapters).forEach(url => {
      if (!allUrls.includes(url)) {
        delete progress.chapters[url];
      }
    });

    await this.save(progress);
    
    return { progress, urlsToProcess };
  }

  async cleanupFailedChapters(progress: ProgressData): Promise<ProgressData> {
    const failedChapters = this.getFailedChapters(progress);
    console.log(`Cleaning up ${failedChapters.length} failed chapters...`);
    
    // Reset failed chapters to pending so they can be retried
    failedChapters.forEach(url => {
      progress.chapters[url] = {
        ...progress.chapters[url],
        status: 'pending',
        error: undefined
      };
    });

    await this.save(progress);
    return progress;
  }
}