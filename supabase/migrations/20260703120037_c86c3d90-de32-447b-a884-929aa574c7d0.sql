
CREATE POLICY "Admins manage partner-logos"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'partner-logos' AND private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'partner-logos' AND private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage carousel-images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'carousel-images' AND private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'carousel-images' AND private.has_role(auth.uid(), 'admin'::app_role));
