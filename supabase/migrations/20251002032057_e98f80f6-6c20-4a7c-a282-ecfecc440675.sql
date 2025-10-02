-- Drop existing public visibility policies
DROP POLICY IF EXISTS "Public tracks are viewable by everyone" ON public.tracks;
DROP POLICY IF EXISTS "Public albums are viewable by everyone" ON public.albums;

-- Create new policy for tracks: only visible if stage_of_production is RELEASED
CREATE POLICY "Public can view released tracks"
ON public.tracks
FOR SELECT
USING (
  visibility = 'Public'::visibility_level 
  AND stage_of_production = 'RELEASED'::production_stage
);

-- Create new policy for albums: only visible if album has released tracks
CREATE POLICY "Public can view albums with released tracks"
ON public.albums
FOR SELECT
USING (
  visibility = 'Public'::visibility_level
  AND status = 'Released'::album_status
  AND (
    -- Either album has no tracks, or all tracks must be released
    NOT EXISTS (
      SELECT 1 FROM public.tracks 
      WHERE album_id = albums.id
    )
    OR NOT EXISTS (
      SELECT 1 FROM public.tracks 
      WHERE album_id = albums.id 
      AND stage_of_production != 'RELEASED'::production_stage
    )
  )
);

-- Create function to auto-release tracks when album is released
CREATE OR REPLACE FUNCTION public.auto_release_tracks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When album status changes to Released, update all tracks to RELEASED stage
  IF NEW.status = 'Released'::album_status AND (OLD.status IS NULL OR OLD.status != 'Released'::album_status) THEN
    UPDATE public.tracks
    SET stage_of_production = 'RELEASED'::production_stage,
        track_status = 'RELEASED'::track_status,
        stage_date = CURRENT_DATE,
        updated_at = now()
    WHERE album_id = NEW.id
    AND stage_of_production != 'RELEASED'::production_stage;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-release tracks
DROP TRIGGER IF EXISTS auto_release_tracks_trigger ON public.albums;
CREATE TRIGGER auto_release_tracks_trigger
AFTER UPDATE OF status ON public.albums
FOR EACH ROW
EXECUTE FUNCTION public.auto_release_tracks();