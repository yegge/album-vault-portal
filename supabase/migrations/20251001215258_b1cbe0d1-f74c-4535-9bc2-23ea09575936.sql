-- Add RLS policies for tracks table to protect write operations

-- Allow authenticated users to insert tracks
CREATE POLICY "Authenticated can insert tracks"
ON public.tracks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update tracks
CREATE POLICY "Authenticated can update tracks"
ON public.tracks
FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete tracks
CREATE POLICY "Authenticated can delete tracks"
ON public.tracks
FOR DELETE
TO authenticated
USING (true);

-- Secure database functions with SECURITY DEFINER and proper search_path

-- Update the update_album_duration function to be secure
CREATE OR REPLACE FUNCTION public.update_album_duration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.albums
  SET album_duration = (
    SELECT SUM(duration)
    FROM public.tracks
    WHERE album_id = COALESCE(NEW.album_id, OLD.album_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.album_id, OLD.album_id);
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update the update_updated_at_column function to be secure
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;