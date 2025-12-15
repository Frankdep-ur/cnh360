-- Verificar e criar políticas de storage para o bucket avatars

-- Policy para SELECT público (bucket já é público)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Avatar images are publicly accessible'
  ) THEN
    CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
  END IF;
END $$;

-- Policy para INSERT - usuários autenticados podem fazer upload no seu próprio folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload own avatar'
  ) THEN
    CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'avatars' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Policy para UPDATE - usuários autenticados podem atualizar seu próprio avatar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update own avatar'
  ) THEN
    CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'avatars' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Policy para DELETE - usuários autenticados podem deletar seu próprio avatar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own avatar'
  ) THEN
    CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'avatars' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;