-- Add new artwork fields to albums table
ALTER TABLE public.albums
ADD COLUMN artwork_fullcover text,
ADD COLUMN artwork_fullinner text;

-- Create storage bucket for artwork and media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('artwork', 'artwork', true);

-- Storage policies for artwork bucket
CREATE POLICY "Artwork images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'artwork');

CREATE POLICY "Admins can upload artwork"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'artwork' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update artwork"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'artwork' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete artwork"
ON storage.objects
FOR DELETE
USING (bucket_id = 'artwork' AND has_role(auth.uid(), 'admin'));