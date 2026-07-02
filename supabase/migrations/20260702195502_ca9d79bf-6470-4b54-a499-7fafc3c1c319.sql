
-- Restaurar EXECUTE para funções necessárias em runtime.
-- handle_new_user e tg_set_updated_at são triggers e precisam de EXECUTE para o role invocador.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.tg_set_updated_at() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_pro(uuid) TO anon, authenticated, service_role;
