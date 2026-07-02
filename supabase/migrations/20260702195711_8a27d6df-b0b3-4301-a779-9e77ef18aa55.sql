
-- 1) tg_set_updated_at: não precisa de DEFINER
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- 2) is_pro: INVOKER — RLS de profiles já permite ler o próprio perfil
CREATE OR REPLACE FUNCTION public.is_pro(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id
      AND plano = 'pro'
      AND (plano_expira_em IS NULL OR plano_expira_em > now())
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_pro(uuid) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.is_pro(uuid) FROM anon, public;

-- 3) handle_new_user: continua DEFINER (insere em public.profiles a partir do trigger em auth.users).
-- Só o supabase_auth_admin invoca esse trigger; revogamos de todo mundo.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin, service_role;

-- Garante que o trigger de signup existe (necessário para criar profile ao cadastrar)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
