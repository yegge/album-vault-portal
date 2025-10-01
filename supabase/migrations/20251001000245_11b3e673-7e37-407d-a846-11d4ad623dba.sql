-- Create enum types
CREATE TYPE album_type AS ENUM ('EP', 'LP', 'SP', 'Compilation');
CREATE TYPE album_status AS ENUM ('In Development', 'Released', 'Removed');
CREATE TYPE visibility_level AS ENUM ('Public', 'VIP', 'Admin');
CREATE TYPE track_status AS ENUM ('WIP', 'B-SIDE', 'RELEASED', 'SHELVED');
CREATE TYPE production_stage AS ENUM (
  'CONCEPTION', 
  'DEMO', 
  'IN SESSION', 
  'OUT SESSION', 
  'IN MIX', 
  'OUT MIX', 
  'IN MASTERING', 
  'OUT MASTERING', 
  'SHELVED', 
  'REMOVED', 
  'RELEASED'
);

-- Create albums table
CREATE TABLE public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_front TEXT NOT NULL,
  artwork_back TEXT,
  artwork_sleeve TEXT,
  artwork_sticker TEXT,
  album_name TEXT NOT NULL,
  album_type album_type NOT NULL,
  album_artist TEXT NOT NULL,
  catalog_number TEXT NOT NULL UNIQUE,
  album_duration INTERVAL,
  upc TEXT,
  distributor TEXT,
  label TEXT,
  release_date DATE,
  removal_date DATE,
  vinyl_cd_release_date DATE,
  producers JSONB,
  engineers JSONB,
  mastering JSONB,
  key_contributors JSONB,
  status album_status NOT NULL DEFAULT 'In Development',
  visibility visibility_level NOT NULL DEFAULT 'Public',
  streaming_links JSONB,
  purchase_links JSONB,
  commentary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tracks table
CREATE TABLE public.tracks (
  track_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  track_number INTEGER NOT NULL,
  track_name TEXT NOT NULL,
  duration INTERVAL NOT NULL,
  artists JSONB,
  composers JSONB,
  key_contributors JSONB,
  isrc TEXT,
  track_status track_status NOT NULL DEFAULT 'WIP',
  stage_of_production production_stage NOT NULL DEFAULT 'CONCEPTION',
  stage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visibility visibility_level NOT NULL DEFAULT 'Public',
  stream_embed TEXT,
  allow_stream BOOLEAN DEFAULT true,
  purchase_link TEXT,
  commentary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(album_id, track_number)
);

-- Enable RLS
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public viewing
CREATE POLICY "Public albums are viewable by everyone"
  ON public.albums FOR SELECT
  USING (visibility = 'Public');

CREATE POLICY "Public tracks are viewable by everyone"
  ON public.tracks FOR SELECT
  USING (
    visibility = 'Public' 
    OR 
    EXISTS (
      SELECT 1 FROM public.albums 
      WHERE albums.id = tracks.album_id 
      AND albums.visibility = 'Public'
    )
  );

-- Function to update album duration when tracks change
CREATE OR REPLACE FUNCTION update_album_duration()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to auto-update album duration
CREATE TRIGGER update_album_duration_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.tracks
FOR EACH ROW
EXECUTE FUNCTION update_album_duration();

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_albums_updated_at
BEFORE UPDATE ON public.albums
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
BEFORE UPDATE ON public.tracks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_albums_artist ON public.albums(album_artist);
CREATE INDEX idx_albums_status ON public.albums(status);
CREATE INDEX idx_albums_visibility ON public.albums(visibility);
CREATE INDEX idx_albums_release_date ON public.albums(release_date DESC);
CREATE INDEX idx_tracks_album_id ON public.tracks(album_id);
CREATE INDEX idx_tracks_number ON public.tracks(album_id, track_number);