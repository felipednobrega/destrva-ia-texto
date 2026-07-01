ALTER TABLE public.redacoes ADD COLUMN IF NOT EXISTS corrigida_em TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_redacoes_user_corrigida_em ON public.redacoes(user_id, corrigida_em);