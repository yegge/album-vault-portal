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
  
  release_date: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid date format"),
  
  commentary: z
    .string()
    .trim()
    .max(2000, "Commentary must be less than 2000 characters")
    .optional()
    .or(z.literal("")),
});

export type AlbumFormData = z.infer<typeof albumFormSchema>;
