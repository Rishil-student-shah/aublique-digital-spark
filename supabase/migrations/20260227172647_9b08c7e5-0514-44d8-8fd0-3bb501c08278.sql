
-- The INSERT WITH CHECK (true) on inquiries is intentional for public contact form submissions.
-- Add a check to ensure required fields are not empty to make the policy more secure.
DROP POLICY "Anyone can submit inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiry" ON public.inquiries
  FOR INSERT WITH CHECK (
    length(trim(name)) > 0 AND
    length(trim(email)) > 0 AND
    length(trim(message)) > 0
  );
