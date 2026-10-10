-- Oceara MRV blockchain integration
-- Migration: project <-> blockchain registry metadata

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS blockchain_project_id TEXT,
ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS blockchain_contract_address TEXT,
ADD COLUMN IF NOT EXISTS blockchain_status TEXT DEFAULT 'NOT_REGISTERED';

CREATE INDEX IF NOT EXISTS idx_projects_blockchain_tx_hash
ON projects(blockchain_tx_hash);

CREATE INDEX IF NOT EXISTS idx_projects_blockchain_status
ON projects(blockchain_status);
