-- Add album_artist column to standalone_tracks table
ALTER TABLE public.standalone_tracks
ADD COLUMN album_artist text;