-- Update the public visibility policy to include removed albums
DROP POLICY IF EXISTS "Public can view albums with released tracks" ON public.albums;

CREATE POLICY "Public can view albums with released tracks" 
ON public.albums 
FOR SELECT 
USING (
  (visibility = 'Public'::visibility_level) 
  AND (status IN ('Released'::album_status, 'Removed'::album_status))
  AND (
    (NOT (EXISTS ( SELECT 1 FROM tracks WHERE (tracks.album_id = albums.id)))) 
    OR (NOT (EXISTS ( SELECT 1 FROM tracks WHERE ((tracks.album_id = albums.id) AND (tracks.stage_of_production <> 'RELEASED'::production_stage)))))
  )
);