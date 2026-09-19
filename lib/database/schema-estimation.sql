-- ML-ready estimation pipeline (no training yet). Run after schema.sql and schema-extensions.sql.
-- Stores inputs and outputs for each estimation for future training data export.

CREATE TABLE IF NOT EXISTS estimation_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  -- Inputs
  area_hectares DECIMAL(12, 4) NOT NULL,
  ecosystem_type TEXT NOT NULL DEFAULT 'mangrove',
  location TEXT,
  coordinates JSONB,
  estimated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Outputs
  estimated_co2_tonnes_per_year DECIMAL(12, 4) NOT NULL,
  methodology_used TEXT NOT NULL,
  confidence_level TEXT NOT NULL DEFAULT 'preliminary',
  estimation_model_version TEXT NOT NULL,
  health_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estimation_runs_project_id ON estimation_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_estimation_runs_estimated_at ON estimation_runs(estimated_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimation_runs_model_version ON estimation_runs(estimation_model_version);

ALTER TABLE estimation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read estimation_runs" ON estimation_runs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can insert estimation_runs" ON estimation_runs FOR INSERT WITH CHECK (true);
