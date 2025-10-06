-- Add album_id column to standalone_tracks to allow linking to albums
ALTER TABLE public.standalone_tracks
ADD COLUMN album_id uuid REFERENCES public.albums(id) ON DELETE SET NULL;

-- Create standalone_track_notes table for track commentary with timestamps
CREATE TABLE public.standalone_track_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id uuid NOT NULL REFERENCES public.standalone_tracks(track_id) ON DELETE CASCADE,
  note_content text NOT NULL,
  user_initials text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on standalone_track_notes
ALTER TABLE public.standalone_track_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for standalone_track_notes
CREATE POLICY "Admins can view all track notes"
ON public.standalone_track_notes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert track notes"
ON public.standalone_track_notes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update track notes"
ON public.standalone_track_notes
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete track notes"
ON public.standalone_track_notes
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better query performance
CREATE INDEX idx_standalone_track_notes_track_id ON public.standalone_track_notes(track_id);