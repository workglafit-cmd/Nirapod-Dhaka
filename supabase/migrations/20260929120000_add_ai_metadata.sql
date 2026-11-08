-- Add AI metadata columns to the reports table
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS ai_severity TEXT,
ADD COLUMN IF NOT EXISTS ai_urgency TEXT,
ADD COLUMN IF NOT EXISTS ai_category TEXT,
ADD COLUMN IF NOT EXISTS ai_incident_type TEXT,
ADD COLUMN IF NOT EXISTS ai_confidence DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS ai_priority_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_reason TEXT;
