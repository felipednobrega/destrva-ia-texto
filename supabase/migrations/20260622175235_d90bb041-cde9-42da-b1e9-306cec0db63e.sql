
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
REVOKE EXECUTE ON FUNCTION public.is_pro(uuid) FROM PUBLIC;
