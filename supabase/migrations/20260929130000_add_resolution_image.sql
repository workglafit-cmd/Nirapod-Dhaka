-- Add resolution_image_url to reports table
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS resolution_image_url TEXT;

-- Create proofs storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for proofs bucket
CREATE POLICY "proofs public read" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'proofs');

CREATE POLICY "proofs authenticated insert" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'proofs');

CREATE POLICY "proofs authenticated update" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (bucket_id = 'proofs');
