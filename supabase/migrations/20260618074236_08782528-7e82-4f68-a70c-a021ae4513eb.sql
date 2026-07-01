
-- Restrict writes on user_roles to admins only (prevent privilege escalation)
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Drop overly broad storage SELECT policy. Public bucket files remain accessible via public URLs;
-- removing this prevents listing all objects in the bucket.
DROP POLICY IF EXISTS "Anyone can view project images" ON storage.objects;

-- Revoke EXECUTE on has_role from anon (only used in RLS context for authenticated users)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
