
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plano text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plano_expira_em timestamptz;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plano_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plano_check CHECK (plano IN ('free','pro'));

CREATE OR REPLACE FUNCTION public.is_pro(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
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
