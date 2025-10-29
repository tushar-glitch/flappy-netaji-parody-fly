CREATE TABLE avatar_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  tagline TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE avatar_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert their own suggestions" ON avatar_suggestions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can see all suggestions" ON avatar_suggestions FOR SELECT USING (get_my_claim('user_role') = 'admin');
