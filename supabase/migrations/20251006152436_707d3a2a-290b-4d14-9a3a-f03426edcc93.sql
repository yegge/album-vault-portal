-- Create standalone_tracks table for tracks not associated with an album
CREATE TABLE public.standalone_tracks (
  track_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_name TEXT NOT NULL,
  duration INTERVAL NOT NULL,
  track_status track_status NOT NULL DEFAULT 'WIP'::track_status,
  stage_of_production production_stage NOT NULL DEFAULT 'CONCEPTION'::production_stage,
  stage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visibility visibility_level NOT NULL DEFAULT 'Public'::visibility_level,
  isrc TEXT,
  stream_embed TEXT,
  allow_stream BOOLEAN DEFAULT true,
  purchase_link TEXT,
  commentary TEXT,
  artists JSONB,
  composers JSONB,
  key_contributors JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.standalone_tracks ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for standalone tracks
CREATE POLICY "Admins can view all standalone tracks"
ON public.standalone_tracks
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert standalone tracks"
ON public.standalone_tracks
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update standalone tracks"
ON public.standalone_tracks
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete standalone tracks"
ON public.standalone_tracks
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_standalone_tracks_updated_at
BEFORE UPDATE ON public.standalone_tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();