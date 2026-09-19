-- Run this in Supabase SQL Editor if you get: Could not find the 'coordinates' column of 'projects'
-- This adds the coordinates column so project creation works.

-- Add coordinates column (stores { "lat": number, "lng": number })
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT '{"lat":0,"lng":0}'::jsonb;

-- Optional: add latitude/longitude for compatibility
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Backfill coordinates from latitude/longitude if they exist and coordinates is null
UPDATE projects
SET coordinates = jsonb_build_object('lat', COALESCE(latitude, 0), 'lng', COALESCE(longitude, 0))
WHERE coordinates IS NULL;

-- Backfill latitude/longitude from coordinates for existing rows
UPDATE projects
SET
  latitude = (coordinates->>'lat')::double precision,
  longitude = (coordinates->>'lng')::double precision
WHERE (latitude IS NULL OR longitude IS NULL) AND coordinates IS NOT NULL;
