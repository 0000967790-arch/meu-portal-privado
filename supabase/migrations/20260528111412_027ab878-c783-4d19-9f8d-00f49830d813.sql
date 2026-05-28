
-- 1. Fix associates RLS: remove unverified JWT email bypass
DROP POLICY IF EXISTS "Associate sees own record" ON public.associates;
CREATE POLICY "Associate sees own record" ON public.associates
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. Auto-link associates to auth users on signup (so user_id-only RLS works)
CREATE OR REPLACE FUNCTION public.link_associate_to_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.associates
     SET user_id = NEW.id
   WHERE user_id IS NULL
     AND lower(email) = lower(NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_link_associate ON auth.users;
CREATE TRIGGER on_auth_user_created_link_associate
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.link_associate_to_auth_user();

-- Backfill existing associates
UPDATE public.associates a
   SET user_id = u.id
  FROM auth.users u
 WHERE a.user_id IS NULL
   AND lower(a.email) = lower(u.email);

-- 3. Move has_role out of exposed public schema to a private schema
CREATE SCHEMA IF NOT EXISTS private;
ALTER FUNCTION public.has_role(uuid, app_role) SET SCHEMA private;
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, app_role) TO authenticated, service_role;

-- Recreate policies that referenced public.has_role to use private.has_role
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage associates" ON public.associates;
CREATE POLICY "Admins manage associates" ON public.associates
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
