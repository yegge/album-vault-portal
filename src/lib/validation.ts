import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

/**
 * Validation schemas for form inputs
 * Provides client-side validation with proper sanitization
 */

export const albumFormSchema = z.object({
  album_name: z
    .string()
    .trim()
    .min(1, "Album name is required")
    .max(200, "Album name must be less than 200 characters"),
  
  album_artist: z
    .string()
    .trim()
    .min(1, "Artist name is required")
    .max(200, "Artist name must be less than 200 characters"),
  
  catalog_number: z
    .string()
    .trim()
    .min(1, "Catalog number is required")
    .max(50, "Catalog number must be less than 50 characters")
    .regex(/^[A-Za-z0-9\-_]+$/, "Catalog number can only contain letters, numbers, hyphens, and underscores"),
  
  album_type: z.enum(["EP", "LP", "SP", "Compilation"] as const),
  
  status: z.enum(["In Development", "Released", "Removed"] as const),
  
  visibility: z.enum(["Public", "VIP", "Admin"] as const),
  
  artwork_front: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters"),
  
  artwork_back: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  artwork_sleeve: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  artwork_sticker: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  artwork_fullcover: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  artwork_fullinner: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  // Streaming links
  apple_music: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  youtube_music: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  tidal: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  spotify: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  // Purchase links
  itunes: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  artcore: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  bandcamp: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  cd_vinyl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  upc: z
    .string()
    .trim()
    .max(20, "UPC must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  
  release_date: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid date format"),
  
  commentary: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export type AlbumFormData = z.infer<typeof albumFormSchema>;

// Helper function to convert MM:SS to PostgreSQL interval format
export const durationToInterval = (duration: string): string => {
  const parts = duration.split(':');
  if (parts.length !== 2) throw new Error("Invalid duration format");
  
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  
  if (isNaN(minutes) || isNaN(seconds) || seconds >= 60 || minutes < 0 || seconds < 0) {
    throw new Error("Invalid duration values");
  }
  
  return `${minutes} minutes ${seconds} seconds`;
};

// Helper function to convert PostgreSQL interval to MM:SS
export const intervalToDuration = (interval: string): string => {
  const minutesMatch = interval.match(/(\d+)\s*minute/);
  const secondsMatch = interval.match(/(\d+)\s*second/);
  
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const trackFormSchema = z.object({
  track_number: z
    .number()
    .int("Track number must be a whole number")
    .min(1, "Track number must be at least 1")
    .max(999, "Track number must be less than 999"),
  
  track_name: z
    .string()
    .trim()
    .min(1, "Track name is required")
    .max(200, "Track name must be less than 200 characters"),
  
  duration: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/, "Duration must be in MM:SS format (e.g., 3:45)")
    .refine((val) => {
      const [mins, secs] = val.split(':').map(Number);
      return secs < 60;
    }, "Seconds must be less than 60"),
  
  track_status: z.enum(["WIP", "RELEASED", "SHELVED", "B-SIDE"] as const),
  
  stage_of_production: z.enum([
    "CONCEPTION",
    "DEMO",
    "IN SESSION",
    "OUT SESSION",
    "IN MIX",
    "OUT MIX",
    "IN MASTERING",
    "OUT MASTERING",
    "RELEASED",
    "REMOVED",
    "SHELVED"
  ] as const),
  
  visibility: z.enum(["Public", "VIP", "Admin"] as const),
  
  allow_stream: z.boolean().optional(),
  
  stream_embed: z
    .string()
    .trim()
    .max(5000, "Embed code must be less than 5000 characters")
    .refine((val) => {
      if (!val) return true;
      // Must contain iframe or audio tag
      return val.includes('<iframe') || val.includes('<audio');
    }, "Embed code must contain valid iframe or audio tag")
    .optional()
    .or(z.literal("")),
  
  isrc: z
    .string()
    .trim()
    .max(20, "ISRC must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  
  commentary: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export type TrackFormData = z.infer<typeof trackFormSchema>;
