import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { timeAgo } from '../../src/lib/utils';

describe('timeAgo', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    // Set a predictable current date
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('should return "just now" for dates less than a second ago or in the future', () => {
    expect(timeAgo(new Date('2024-01-01T12:00:00.000Z'))).toBe('just now');
    expect(timeAgo(new Date('2024-01-01T11:59:59.500Z'))).toBe('just now'); // 0.5s ago -> 0 seconds
    expect(timeAgo(new Date('2024-01-01T12:00:05.000Z'))).toBe('just now'); // 5s in future -> 0 seconds (Math.floor(-5) = -5, which is handled as 0 due to Math.floor)
  });

  it('should correctly format seconds', () => {
    // 1 second ago
    expect(timeAgo(new Date('2024-01-01T11:59:59.000Z'))).toBe('1 second ago');
    // 45 seconds ago
    expect(timeAgo(new Date('2024-01-01T11:59:15.000Z'))).toBe('45 seconds ago');
  });

  it('should correctly format minutes', () => {
    // 1 minute ago (60 seconds)
    expect(timeAgo(new Date('2024-01-01T11:59:00.000Z'))).toBe('1 minute ago');
    // 5 minutes ago (300 seconds)
    expect(timeAgo(new Date('2024-01-01T11:55:00.000Z'))).toBe('5 minutes ago');
  });

  it('should correctly format hours', () => {
    // 1 hour ago
    expect(timeAgo(new Date('2024-01-01T11:00:00.000Z'))).toBe('1 hour ago');
    // 2 hours ago
    expect(timeAgo(new Date('2024-01-01T10:00:00.000Z'))).toBe('2 hours ago');
  });

  it('should correctly format days', () => {
    // 1 day ago
    expect(timeAgo(new Date('2023-12-31T12:00:00.000Z'))).toBe('1 day ago');
    // 5 days ago
    expect(timeAgo(new Date('2023-12-27T12:00:00.000Z'))).toBe('5 days ago');
  });

  it('should correctly format weeks', () => {
    // 1 week ago (7 days = 604800 seconds)
    expect(timeAgo(new Date('2023-12-25T12:00:00.000Z'))).toBe('1 week ago');
    // 3 weeks ago
    expect(timeAgo(new Date('2023-12-11T12:00:00.000Z'))).toBe('3 weeks ago');
  });

  it('should correctly format months', () => {
    // 1 month ago (30 days = 2592000 seconds)
    // 2024-01-01 minus 30 days is 2023-12-02
    expect(timeAgo(new Date('2023-12-02T12:00:00.000Z'))).toBe('1 month ago');

    // 2 months ago
    expect(timeAgo(new Date('2023-11-02T12:00:00.000Z'))).toBe('2 months ago');
  });

  it('should correctly format years', () => {
    // 1 year ago (365 days = 31536000 seconds)
    expect(timeAgo(new Date('2023-01-01T12:00:00.000Z'))).toBe('1 year ago');

    // 2 years ago
    expect(timeAgo(new Date('2022-01-01T12:00:00.000Z'))).toBe('2 years ago');
  });
});
