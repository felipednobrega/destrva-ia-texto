import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Zap,
  ArrowRight,
  Shield,
  Infinity as InfinityIcon,
  Target,
  BookOpen,
  PenLine,
  LineChart,
  Headphones,
  Clock,
  Star,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Plano · Redação 900+ com IA" },
      {
        name: "description",
        content:
          "Correções ilimitadas pela IA treinada com critérios INEP por R$ 19,90/mês. Sem fidelidade.",
      },
      { property: "og:title", content: "Plano · Redação 900+ com IA" },
      {
        property: "og:description",
        content: "Correções ilimitadas pela IA treinada com critérios INEP por R$ 19,90/mês.",
      },
    ],
  }),
  component: PricingPage,
});

const benefits = [
  {
    icon: InfinityIcon,
    title: "Correções ilimitadas",
    desc: "Mande quantas redações quiser. Sem cota mensal, sem créditos.",
  },
  {
    icon: Target,
    title: "Nota nas 5 competências",
    desc: "Pontuação detalhada por competência, igual à correção oficial do INEP.",
  },
  {
    icon: PenLine,
    title: "Feedback acionável",
    desc: "Recebe o que cortar, o que melhorar e o que manter — parágrafo por parágrafo.",
  },
  {
    icon: BookOpen,
    title: "Repertório por tema",
    desc: "Citações, dados e exemplos sugeridos pra encaixar no tema da sua redação.",
  },
  {
    icon: Sparkles,
    title: "Reescrita assistida por IA",
    desc: "Trechos travados? A IA mostra duas versões reescritas com explicação.",
  },
  {
    icon: LineChart,
    title: "Histórico de evolução",
    desc: "Acompanha como suas notas sobem competência por competência ao longo do tempo.",
  },
  {
    icon: Clock,
    title: "Banco com 200+ temas ENEM",
    desc: "Temas reais e simulados pra treinar pressão e cronômetro de prova.",
  },
  {
    icon: Headphones,
    title: "Suporte prioritário",
    desc: "Dúvida sobre nota ou correção? Resposta no mesmo dia.",
  },
];

const planFeatures = [
  "Correções ilimitadas pela IA com critérios INEP",
  "Nota detalhada nas 5 competências",
  "Feedback acionável parágrafo por parágrafo",
  "Repertório sugerido por tema",
  "Banco com 200+ temas ENEM",
  "Histórico de evolução e comparativos",
  "Reescrita assistida por IA",
  "Suporte prioritário no mesmo dia",
];

const faqs = [
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Cancela em 1 clique direto na sua conta, sem ligação e sem multa. O acesso continua até o fim do ciclo já pago.",
  },
  {
    q: "Tem cota de correções por mês?",
    a: "Não. Correções são ilimitadas enquanto o plano estiver ativo — mande quantas redações precisar.",
  },
  {
    q: "Como funciona a garantia de 7 dias?",
    a: "Se não gostar nos primeiros 7 dias, devolvemos 100% do valor. Sem perguntar o motivo.",
  },
  {
    q: "A IA corrige no padrão INEP mesmo?",
    a: "Sim. Ela foi treinada com milhares de redações corrigidas por avaliadores reais e segue o manual de correção mais recente.",
  },
];

function PricingPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setAuthed(!!data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const backTo = authed ? "/dashboard" : "/";
  const ctaTo = authed ? "/dashboard" : "/auth";
  const ctaLabel = authed ? "Voltar para o painel" : "Entrar";

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-neutral-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="max-w-7xl mx-auto px-6 sm:px-10 pt-8 flex items-center justify-between">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <Link to={ctaTo} className="text-sm font-bold text-neutral-700 hover:text-neutral-900">
          {ctaLabel}
        </Link>
      </header>

      {/* HERO */}
      <section className="max-w-3xl mx-auto px-6 sm:px-10 pt-14 sm:pt-20 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-[0.18em]">
            <Sparkles className="w-3 h-3" />
            Plano único, sem pegadinha
          </div>
          <h1 className="text-[34px] sm:text-5xl md:text-7xl font-black leading-[1.05] sm:leading-[1] tracking-tight">
            Tudo o que você precisa para os{" "}
            <span className="underline decoration-indigo-500 decoration-[6px] underline-offset-[8px]">
              900+
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-500 font-medium max-w-xl mx-auto">
            Um plano, acesso completo. Sem créditos, sem upsell, sem fidelidade.
          </p>
          <div className="flex items-center justify-center gap-1 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-xs font-bold text-neutral-500">
              4,9 · +47 mil estudantes
            </span>
          </div>
        </motion.div>
      </section>

      {/* PLAN CARD */}
      <section className="max-w-xl mx-auto px-6 sm:px-10 pb-20">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-[32px] p-8 sm:p-10 bg-neutral-950 text-white ring-1 ring-neutral-800 shadow-[0_30px_80px_-20px_rgba(79,70,229,0.5)] overflow-hidden"
        >
          <div className="absolute -top-32 -right-32 w-[320px] h-[320px] bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-[280px] h-[280px] bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none" />

          <span className="relative inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg whitespace-nowrap mb-6">
            Acesso completo
          </span>

          <div className="relative flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl grid place-items-center bg-white/10 text-indigo-300">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Plano Mensal</h3>
              <p className="text-xs font-medium text-white/60">
                Tudo desbloqueado. Cancele quando quiser.
              </p>
            </div>
          </div>

          <div className="relative mb-8">
            <div className="text-sm font-bold text-white/40 line-through mb-1">R$ 49,90</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white/60">R$</span>
              <span className="text-6xl font-black tracking-tight tabular-nums">19,90</span>
              <span className="text-sm font-bold text-white/50">/mês</span>
            </div>
            <p className="text-xs text-emerald-300 font-bold mt-2">
              Economia de 60% por tempo limitado
            </p>
          </div>

          <ul className="relative space-y-3 mb-8">
            {planFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm font-medium">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                <span className="text-white/85">{f}</span>
              </li>
            ))}
          </ul>

          <Button
            asChild
            className="relative w-full h-14 rounded-2xl text-base font-black group bg-white text-neutral-900 hover:bg-neutral-100 shadow-xl"
          >
            <Link to={ctaTo}>
              {authed ? "Continuar no painel" : "Desbloquear por R$ 19,90"}
              <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <div className="relative flex items-center justify-center gap-2 mt-5 text-xs text-white/50 font-bold">
            <Shield className="w-3.5 h-3.5" />
            Garantia de 7 dias · Cancele com 1 clique
          </div>
        </motion.article>
      </section>

      {/* BENEFITS GRID */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-[0.18em] mb-4">
            <Check className="w-3 h-3" />O que você leva
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-[1.1]">
            Ao adquirir, você desbloqueia <span className="text-indigo-600">tudo</span> isso
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="group p-6 rounded-3xl bg-white ring-1 ring-neutral-200/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] hover:ring-indigo-300 hover:-translate-y-0.5 transition-all"
              >
                <div className="w-11 h-11 rounded-2xl grid place-items-center bg-indigo-50 text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base tracking-tight mb-1.5">{b.title}</h3>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed">{b.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* COMPARE */}
      <section className="max-w-3xl mx-auto px-6 sm:px-10 pb-24">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-3xl p-7 bg-neutral-100 ring-1 ring-neutral-200">
            <p className="text-[11px] font-black uppercase tracking-wider text-neutral-500 mb-3">
              Sem o plano
            </p>
            <ul className="space-y-2.5 text-sm font-medium text-neutral-500">
              {[
                "1 correção por semana",
                "Nota estimada e resumida",
                "Sem repertório por tema",
                "Sem histórico de evolução",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl p-7 bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-[0_20px_60px_-20px_rgba(79,70,229,0.6)]">
            <p className="text-[11px] font-black uppercase tracking-wider text-white/70 mb-3">
              Com o plano de R$ 19,90
            </p>
            <ul className="space-y-2.5 text-sm font-bold">
              {[
                "Correções ilimitadas",
                "Feedback completo nas 5 competências",
                "Repertório sugerido por tema",
                "Evolução acompanhada no tempo",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-300" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 sm:px-10 pb-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-bold uppercase tracking-[0.18em] mb-3">
            <HelpCircle className="w-3 h-3" />
            Perguntas frequentes
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Dúvidas antes de assinar?
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl bg-white ring-1 ring-neutral-200 p-5 open:ring-indigo-300 transition-all"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none font-black text-sm sm:text-base">
                {f.q}
                <span className="ml-4 w-7 h-7 rounded-full bg-neutral-100 grid place-items-center text-neutral-500 group-open:bg-indigo-600 group-open:text-white group-open:rotate-45 transition-all">
                  <span className="text-lg leading-none -mt-0.5">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm text-neutral-600 font-medium leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto px-6 sm:px-10 pb-24">
        <div className="rounded-[32px] bg-neutral-950 text-white p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-50 pointer-events-none">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-indigo-600/40 rounded-full blur-[120px]" />
          </div>
          <h2 className="relative text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] mb-4">
            Sua próxima redação pode ser a do <span className="text-indigo-300">900+</span>.
          </h2>
          <p className="relative text-white/70 font-medium max-w-lg mx-auto mb-8">
            Por menos do que um lanche, você destrava correções ilimitadas até a prova.
          </p>
          <Button
            asChild
            className="relative h-14 px-8 rounded-2xl text-base font-black bg-white text-neutral-900 hover:bg-neutral-100 shadow-xl group"
          >
            <Link to={ctaTo}>
              {authed ? "Voltar para o painel" : "Quero meu acesso por R$ 19,90"}
              <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <p className="relative mt-6 text-xs text-white/40 font-bold">
            Garantia de 7 dias · Cancele com 1 clique · Sem fidelidade
          </p>
        </div>
        <p className="text-center text-xs text-neutral-400 mt-10">
          Precisa de plano para escola ou cursinho?{" "}
          <a
            href="mailto:contato@exemplo.com"
            className="underline text-neutral-700 hover:text-neutral-900"
          >
            Fale com a gente
          </a>
          .
        </p>
      </section>
    </div>
  );
}
