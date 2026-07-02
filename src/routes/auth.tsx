import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar · Redação 900+ com IA" },
      {
        name: "description",
        content: "Acesse sua conta e continue sua jornada rumo aos 900+ na redação do ENEM.",
      },
      { property: "og:title", content: "Entrar · Redação 900+ com IA" },
      {
        property: "og:description",
        content: "Acesse sua conta e continue sua jornada rumo aos 900+ na redação do ENEM.",
      },
    ],
  }),
  component: AuthPage,
});

function traduzirErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "Email ou senha incorretos.";
  if (m.includes("email not confirmed"))
    return "Confirme seu email antes de entrar. Verifique sua caixa de entrada.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Este email já tem uma conta. Tente entrar.";
  if (m.includes("password should be") || m.includes("password is too short"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes"))
    return "Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.";
  if (m.includes("network") || m.includes("failed to fetch"))
    return "Sem conexão. Verifique sua internet e tente de novo.";
  if (m.includes("unable to validate email"))
    return "Email inválido. Confira o endereço.";
  return msg;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPwd, setShowPwd] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [precisaConfirmarEmail, setPrecisaConfirmarEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigatedRef = useRef(false);

  function switchMode(m: "login" | "signup") {
    setMode(m);
    setSenha("");
    setShowPwd(false);
    setNome("");
    setPrecisaConfirmarEmail(false);
  }

  useEffect(() => {
    let active = true;
    const goDashboard = () => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      router.navigate({ to: "/dashboard", replace: true });
    };
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session?.user) goDashboard();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") && session?.user) {
        goDashboard();
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !senha) {
      toast.error("Preencha email e senha.");
      return;
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      toast.error("Email inválido. Confira o endereço.");
      return;
    }
    if (senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    setPrecisaConfirmarEmail(false);
    try {
      if (mode === "signup") {
        const nomeLimpo = nome.trim();
        if (nomeLimpo.length > 80) {
          toast.error("O nome é muito longo (máx. 80 caracteres).");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: senha,
          options: {
            data: { display_name: nomeLimpo || cleanEmail.split("@")[0] },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        // Supabase retorna user com identities vazio quando o email já existe
        // (proteção contra enumeração). Detectamos e avisamos o usuário.
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
          toast.error("Este email já tem uma conta. Tente entrar.");
          switchMode("login");
          setEmail(cleanEmail);
          return;
        }
        if (!data.session) {
          toast.success("Conta criada! Verifique seu email para confirmar o cadastro.");
          switchMode("login");
          setEmail(cleanEmail);
          return;
        }
        toast.success("Conta criada! Bem-vindo.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: senha,
        });
        if (error) throw error;
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Erro ao autenticar";
      if (raw.toLowerCase().includes("email not confirmed")) setPrecisaConfirmarEmail(true);
      toast.error(traduzirErro(raw));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    if (resendLoading) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Digite seu email primeiro.");
      return;
    }
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
      toast.success("Email de confirmação reenviado. Verifique sua caixa de entrada.");
    } catch (err) {
      toast.error(err instanceof Error ? traduzirErro(err.message) : "Erro ao reenviar email");
    } finally {
      setResendLoading(false);
    }
  }

  async function handleGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth`,
      });
      if (result.error) {
        const msg = result.error.message ?? "";
        toast.error(
          msg.toLowerCase().includes("popup")
            ? "O popup do Google foi bloqueado. Permita popups e tente novamente."
            : "Falha no login com Google. Tente novamente.",
        );
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) {
        // O browser está saindo da página — mantém loading até o redirect concluir.
        return;
      }
      // Popup concluído: tokens recebidos e sessão setada.
      // Navega imediatamente (fallback caso onAuthStateChange demore).
      const { data } = await supabase.auth.getSession();
      if (data.session?.user && !navigatedRef.current) {
        navigatedRef.current = true;
        router.navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? traduzirErro(err.message) : "Erro no login com Google");
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (forgotLoading) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Digite seu email primeiro.");
      return;
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      toast.error("Email inválido. Confira o endereço.");
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Enviamos um link de redefinição para seu email.");
    } catch (err) {
      toast.error(err instanceof Error ? traduzirErro(err.message) : "Erro ao enviar email");
    } finally {
      setForgotLoading(false);
    }
  }



  return (
    <div className="min-h-dvh bg-[#FDFDFF] text-neutral-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex">
      {/* Left brand panel */}
      <aside className="hidden lg:flex relative w-[46%] xl:w-[42%] bg-neutral-950 text-white p-10 xl:p-16 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-indigo-600 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] bg-fuchsia-600 rounded-full blur-[120px]" />
        </div>

        <Link
          to="/"
          className="relative inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o site
        </Link>

        <div className="relative space-y-8 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur ring-1 ring-white/15 text-[11px] uppercase tracking-[0.18em] font-bold">
            <Sparkles className="w-3 h-3 text-indigo-300" />
            Plataforma #1 de redação
          </div>
          <h1 className="text-4xl xl:text-5xl font-black leading-[1.05] tracking-tight">
            Continue sua jornada rumo aos{" "}
            <span className="bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
              900+
            </span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Mais de 47 mil estudantes já corrigiram redações com nossa IA treinada pelos critérios
            INEP.
          </p>
          <ul className="space-y-3 pt-2">
            {[
              "Correção em 60 segundos pelos 5 critérios",
              "Feedback acionável competência por competência",
              "Repertório sugerido por tema",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3 text-white/85 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-xs text-white/40 font-medium">
          © {new Date().getFullYear()} Redação 900+
        </div>
      </aside>

      {/* Right form panel */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="lg:hidden inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          {/* Tabs */}
          <div className="inline-flex p-1 bg-neutral-100 rounded-full mb-6 sm:mb-8 w-full sm:w-auto">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 text-sm font-bold rounded-full transition-all ${
                  mode === m
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <h2 className="text-3xl sm:text-[34px] font-black leading-[1.05] tracking-tight mb-2">
            {mode === "login" ? "Bem-vindo de volta." : "Crie sua conta grátis."}
          </h2>
          <p className="text-neutral-500 mb-8 font-medium">
            {mode === "login"
              ? "Entre para continuar suas correções."
              : "Comece a corrigir redações em segundos."}
          </p>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full h-12 inline-flex items-center justify-center gap-3 rounded-2xl bg-white border-2 border-neutral-200 hover:border-neutral-900 font-bold text-sm transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            {googleLoading ? "Conectando…" : "Continuar com Google"}
          </button>


          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
              ou com email
            </span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <Field label="Nome">
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Como devemos te chamar?"
                  autoComplete="name"
                  maxLength={80}
                  className="h-12 rounded-xl border-neutral-200 focus-visible:ring-indigo-500"
                />
              </Field>
            )}
            <Field label="Email" icon={<Mail className="w-4 h-4" />}>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                autoComplete="email"
                inputMode="email"
                className="h-12 pl-10 rounded-xl border-neutral-200 focus-visible:ring-indigo-500"
              />
            </Field>
            <Field
              label="Senha"
              icon={<Lock className="w-4 h-4" />}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            >
              <Input
                type={showPwd ? "text" : "password"}
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="h-12 pl-10 pr-10 rounded-xl border-neutral-200 focus-visible:ring-indigo-500"
              />
            </Field>

            {mode === "login" && (
              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  {forgotLoading ? "Enviando…" : "Esqueci minha senha"}
                </button>
              </div>
            )}

            {mode === "login" && precisaConfirmarEmail && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800 font-medium flex-1">
                  Não recebeu o email de confirmação?{" "}
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    className="font-bold underline hover:text-amber-900 disabled:opacity-50"
                  >
                    {resendLoading ? "Reenviando…" : "Reenviar email"}
                  </button>
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-base font-black shadow-xl shadow-neutral-900/15 disabled:opacity-50"
            >
              {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta grátis"}
            </Button>
          </form>


          <p className="text-xs text-neutral-400 font-medium mt-6 text-center">
            Ao continuar você aceita nossos <span className="underline">Termos</span> e{" "}
            <span className="underline">Privacidade</span>.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

function Field({
  label,
  icon,
  suffix,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
        {label}
      </span>
      <span className="relative block">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {icon}
          </span>
        )}
        {children}
        {suffix && <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</span>}
      </span>
    </label>
  );
}
