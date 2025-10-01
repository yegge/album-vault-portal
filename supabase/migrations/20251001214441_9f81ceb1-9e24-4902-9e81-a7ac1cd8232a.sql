-- Enable RLS for albums (noop if already enabled)
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to fully manage albums
CREATE POLICY "Authenticated can view all albums"
ON public.albums
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert albums"
ON public.albums
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update albums"
ON public.albums
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated can delete albums"
ON public.albums
FOR DELETE
TO authenticated
USING (true);