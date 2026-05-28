
DROP TRIGGER IF EXISTS on_auth_user_created_link_associate ON auth.users;
ALTER FUNCTION public.link_associate_to_auth_user() SET SCHEMA private;
REVOKE EXECUTE ON FUNCTION private.link_associate_to_auth_user() FROM PUBLIC;
CREATE TRIGGER on_auth_user_created_link_associate
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION private.link_associate_to_auth_user();
