-- Enhanced projects schema for Work section upgrade

-- Add new columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'web-development';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS results JSONB DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS testimonial_text TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS testimonial_author TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS testimonial_role TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Project views analytics table
CREATE TABLE IF NOT EXISTS project_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  referrer TEXT,
  user_agent TEXT
);

-- Index for fast view count queries
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_viewed_at ON project_views(viewed_at);

-- RLS for project_views
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT a view (anonymous page visits)
CREATE POLICY "Anyone can record a view" ON project_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can SELECT views (for analytics dashboard)
CREATE POLICY "Admins can view analytics" ON project_views
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can DELETE views (cleanup)
CREATE POLICY "Admins can delete views" ON project_views
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));
