-- Oceara Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table - stores all mangrove restoration projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  owner_email TEXT,
  location TEXT NOT NULL,
  coordinates JSONB NOT NULL, -- {lat: number, lng: number}
  area TEXT NOT NULL,
  credits_available INTEGER NOT NULL DEFAULT 0,
  price_per_credit DECIMAL(10, 2) NOT NULL,
  verified BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Pending Review' 
    CHECK (status IN ('Pending Review', 'Under Verification', 'Verified', 'Active', 'Rejected')),
  impact TEXT,
  image TEXT,
  description TEXT,
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  images TEXT[], -- Array of image URLs
  satellite_images TEXT[], -- Array of satellite image URLs
  field_data JSONB, -- {trees, species, soilType, waterSalinity}
  ml_analysis JSONB, -- {treeCount, mangroveArea, healthScore, speciesDetected, carbonCredits, confidence}
  documents TEXT[], -- Array of document URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on owner for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner);
CREATE INDEX IF NOT EXISTS idx_projects_owner_email ON projects(owner_email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_verified ON projects(verified);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Users table - stores user information (if not using Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('landowner', 'buyer', 'admin')),
  google_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Transactions table - for tracking carbon credit purchases
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  buyer_email TEXT NOT NULL,
  credits_purchased INTEGER NOT NULL,
  price_per_credit DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_hash TEXT, -- Blockchain transaction hash
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_email ON transactions(buyer_email);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all projects
CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

-- Policy: Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT WITH CHECK (true); -- You can add auth check: auth.role() = 'authenticated'

-- Policy: Users can update their own projects
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (true); -- You can restrict: owner_email = auth.email()

-- Policy: Admins can update any project
CREATE POLICY "Admins can update any project" ON projects
  FOR UPDATE USING (true); -- Add admin check: auth.jwt() ->> 'role' = 'admin'

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (true); -- Add: buyer_email = auth.email()

-- Policy: Authenticated users can create transactions
CREATE POLICY "Authenticated users can create transactions" ON transactions
  FOR INSERT WITH CHECK (true);

