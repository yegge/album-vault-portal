-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update albums RLS policies to require admin role
DROP POLICY IF EXISTS "Authenticated can delete albums" ON public.albums;
DROP POLICY IF EXISTS "Authenticated can insert albums" ON public.albums;
DROP POLICY IF EXISTS "Authenticated can update albums" ON public.albums;
DROP POLICY IF EXISTS "Authenticated can view all albums" ON public.albums;

CREATE POLICY "Admins can delete albums"
ON public.albums
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert albums"
ON public.albums
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update albums"
ON public.albums
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all albums"
ON public.albums
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update tracks RLS policies to require admin role
DROP POLICY IF EXISTS "Authenticated can delete tracks" ON public.tracks;
DROP POLICY IF EXISTS "Authenticated can insert tracks" ON public.tracks;
DROP POLICY IF EXISTS "Authenticated can update tracks" ON public.tracks;

CREATE POLICY "Admins can delete tracks"
ON public.tracks
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert tracks"
ON public.tracks
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tracks"
ON public.tracks
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all tracks"
ON public.tracks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));