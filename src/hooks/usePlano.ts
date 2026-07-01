import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Plano = "free" | "pro";

/**
 * Retorna o plano atual do usuário logado e se a assinatura Pro está ativa.
 * Usuários sem perfil ou sem sessão são tratados como "free".
 */
export function usePlano() {
  const { data, isLoading } = useQuery({
    queryKey: ["plano"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { plano: "free" as Plano, expiraEm: null as string | null };
      const { data: p } = await supabase
        .from("profiles")
        .select("plano, plano_expira_em")
        .eq("id", u.user.id)
        .maybeSingle();
      return {
        plano: (p?.plano ?? "free") as Plano,
        expiraEm: p?.plano_expira_em ?? null,
      };
    },
    staleTime: 60_000,
  });

  const ativo =
    data?.plano === "pro" && (!data.expiraEm || new Date(data.expiraEm) > new Date());

  return {
    plano: data?.plano ?? "free",
    isPro: !!ativo,
    isLoading,
  };
}
