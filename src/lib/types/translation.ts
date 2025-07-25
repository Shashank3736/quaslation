import { z } from "zod";

// Translation request schema
export const TranslationRequestSchema = z.object({
  html: z.string().min(1, "HTML content is required"),
  sourceLanguage: z.string().optional().default("auto"),
  targetLanguage: z.string().min(2, "Target language is required"),
});

export type TranslationRequest = z.infer<typeof TranslationRequestSchema>;

// Translation parameters
export type TranslationParams = {
  html: string;
  sourceLanguage?: string;
  targetLanguage: string;
};

// Error response
export type TranslationError = {
  error: string;
  status: number;
};

// Rate limiting configuration
export const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
};