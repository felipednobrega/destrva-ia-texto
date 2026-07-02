REVOKE EXECUTE ON FUNCTION public.is_pro(uuid) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.is_pro(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM anon, authenticated, public;