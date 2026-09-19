-- Run this in Supabase SQL Editor if you get: Could not find the 'location' (or other) column of 'projects'
-- Adds all columns the app expects so project creation and listing work.

-- Core columns used on every project insert
ALTER TABLE projects ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT '{"lat":0,"lng":0}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS credits_available NUMERIC DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS price_per_credit NUMERIC DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending Review';

-- Optional columns the app uses
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS satellite_images TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS field_data JSONB;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ml_analysis JSONB;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS documents TEXT[];
