import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha · Redação 900+" },
      { name: "description", content: "Defina uma nova senha para sua conta." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase processa o token de recuperação no hash da URL automaticamente
    // e dispara PASSWORD_RECOVERY. Aguardamos uma sessão estar disponível.
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        setReady(true);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      toast.success("Senha atualizada! Redirecionando…");
      setTimeout(() => router.navigate({ to: "/dashboard", replace: true }), 800);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#FDFDFF] flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-md">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para login
        </Link>

        <h1 className="text-3xl font-black tracking-tight mb-2">Redefinir senha</h1>
        <p className="text-neutral-500 mb-8 font-medium">
          {ready
            ? "Escolha uma nova senha para entrar na sua conta."
            : "Validando link de recuperação…"}
        </p>

        {ready ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Nova senha
              </span>
              <span className="relative block">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <Input
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={6}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className="h-12 pl-10 pr-10 rounded-xl border-neutral-200 focus-visible:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </span>
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-base font-black disabled:opacity-50"
            >
              {loading ? "Salvando…" : "Salvar nova senha"}
            </Button>
          </form>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
            Se você chegou aqui sem clicar no link do email, peça um novo link em{" "}
            <Link to="/auth" className="font-bold text-indigo-600 hover:underline">
              Entrar
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}
