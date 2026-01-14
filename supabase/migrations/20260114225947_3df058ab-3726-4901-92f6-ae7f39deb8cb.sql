-- Add fields to progresso_renach for DETRAN exam certificate upload
ALTER TABLE public.progresso_renach
ADD COLUMN IF NOT EXISTS certificado_teorico_url TEXT,
ADD COLUMN IF NOT EXISTS certificado_teorico_enviado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS prova_teorica_detran_aprovada BOOLEAN DEFAULT false;

-- Create storage bucket for certificates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificados',
  'certificados',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for certificados bucket
CREATE POLICY "Users can upload their own certificates"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'certificados' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own certificates"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'certificados' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own certificates"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'certificados' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own certificates"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'certificados' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);