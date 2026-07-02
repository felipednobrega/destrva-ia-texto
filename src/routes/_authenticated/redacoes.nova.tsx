import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, Sparkles, Lock, Lightbulb, Pencil, Shuffle, Crown, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { corrigirRedacao } from "@/lib/redacoes.functions";
import { usePlano } from "@/hooks/usePlano";
import { AnalisandoRedacao } from "@/components/AnalisandoRedacao";
import {
  TEMAS,
  getTemaDoDia,
  getTemaDoDiaParaUsuario,
  sortearTemaInedito,
  type Tema,
} from "@/lib/temas";

export const Route = createFileRoute("/_authenticated/redacoes/nova")({
  component: NovaRedacaoPage,
});

type Modo = "sugerido" | "livre";

function NovaRedacaoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const corrigir = useServerFn(corrigirRedacao);
  const { isPro, isLoading: planoLoading } = usePlano();

  const [modo, setModo] = useState<Modo>("sugerido");
  const [temasFeitos, setTemasFeitos] = useState<string[]>([]);
  const [temaSelecionado, setTemaSelecionado] = useState<Tema>(() => getTemaDoDia());
  const [temaLivre, setTemaLivre] = useState("");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [analisando, setAnalisando] = useState(false);

  // Quantas redações o usuário já teve corrigidas hoje (para gate do plano free)
  const { data: corrigidasHoje = 0, isLoading: usoLoading } = useQuery({
    queryKey: ["corrigidasHoje"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return 0;
      const inicio = new Date();
      inicio.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("redacoes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", u.user.id)
        .gte("corrigida_em", inicio.toISOString());
      return count ?? 0;
    },
    staleTime: 30_000,
  });

  const bloqueadoPorPlano = !planoLoading && !isPro && corrigidasHoje >= 1;

  // Busca títulos já feitos pelo usuário para não repetir o tema sugerido.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("redacoes")
        .select("tema")
        .eq("user_id", u.user.id)
        .eq("status", "corrigida");
      if (cancelled || !data) return;
      const titulos = data.map((r) => r.tema).filter(Boolean) as string[];
      setTemasFeitos(titulos);
      setTemaSelecionado(getTemaDoDiaParaUsuario(titulos));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const todosFeitos = temasFeitos.length >= TEMAS.length;
  const tema = modo === "sugerido" ? temaSelecionado.titulo : temaLivre;
  const textoTrim = texto.trim();
  const linhas = textoTrim ? texto.split("\n").length : 0;
  const palavras = textoTrim ? textoTrim.split(/\s+/).filter(Boolean).length : 0;


  async function handleCorrigir() {
    if (bloqueadoPorPlano) {
      router.navigate({ to: "/pricing" });
      return;
    }
    const temaLimpo = tema.trim();
    const textoLimpo = texto.trim();
    if (!temaLimpo || textoLimpo.length < 200) {
      toast.error("Informe o tema e escreva pelo menos 200 caracteres.");
      return;
    }
    setLoading(true);
    setAnalisando(true);
    const inicio = Date.now();
    let redacaoId: string | null = null;
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Sessão expirada");
      const { data, error } = await supabase
        .from("redacoes")
        .insert({ user_id: user.user.id, tema: temaLimpo, texto: textoLimpo, status: "corrigindo" })
        .select("id")
        .single();
      if (error || !data) throw error ?? new Error("Falha ao salvar");
      redacaoId = data.id;
      await corrigir({ data: { redacaoId: data.id } });
      const restante = 4_000 - (Date.now() - inicio);
      if (restante > 0) await new Promise((r) => setTimeout(r, restante));
      await qc.invalidateQueries({ queryKey: ["corrigidasHoje"] });
      await qc.invalidateQueries({ queryKey: ["redacoes"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Redação corrigida!");
      router.navigate({ to: "/redacoes/$id", params: { id: data.id } });
    } catch (e) {
      if (redacaoId) {
        await supabase
          .from("redacoes")
          .update({ status: "rascunho" })
          .eq("id", redacaoId);
        await qc.invalidateQueries({ queryKey: ["redacoes"] });
        await qc.invalidateQueries({ queryKey: ["dashboard"] });
      }
      toast.error(e instanceof Error ? e.message : "Erro ao corrigir");
      setAnalisando(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvarRascunho() {
    if (!tema.trim() || !texto.trim()) {
      toast.error("Preencha o tema e o texto antes de salvar.");
      return;
    }
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    const { error } = await supabase
      .from("redacoes")
      .insert({ user_id: user.user.id, tema, texto, status: "rascunho" });
    if (error) toast.error(error.message);
    else {
      await qc.invalidateQueries({ queryKey: ["redacoes"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Rascunho salvo");
      router.navigate({ to: "/redacoes" });
    }
  }

  if (usoLoading || planoLoading) {
    return (
      <div className="p-8 text-neutral-500 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
      </div>
    );
  }

  if (bloqueadoPorPlano) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto">
        <Link
          to="/redacoes"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 p-8 sm:p-10 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-[11px] font-black uppercase tracking-[0.18em] mb-5">
            <Crown className="w-3.5 h-3.5" />
            Limite diário atingido
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 mb-3">
            Você já fez sua redação de hoje
          </h1>
          <p className="text-neutral-600 mb-6 leading-relaxed">
            No plano <strong>Free</strong>, você tem direito a <strong>1 correção por dia</strong>.
            Sua nota está salva e você pode revê-la quando quiser. Para escrever mais redações
            ainda hoje, desbloqueie o plano <strong>Pro</strong>.
          </p>

          <div className="rounded-2xl bg-white border border-neutral-200 p-5 mb-6">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-black text-neutral-950">R$ 19,90</span>
              <span className="text-sm text-neutral-500 font-medium">/ mês</span>
            </div>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                Correções ilimitadas com IA
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                Sorteie quantos temas quiser
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                Feedback completo nas 5 competências
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-800"
            >
              <Crown className="w-4 h-4" /> Desbloquear por R$ 19,90
            </Link>
            <Link
              to="/redacoes"
              className="inline-flex items-center gap-2 bg-white border-2 border-neutral-200 hover:border-neutral-900 px-6 py-3 rounded-2xl text-sm font-bold"
            >
              Ver minhas redações
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {analisando && <AnalisandoRedacao />}
      <Link
        to="/redacoes"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <h1 className="text-3xl font-black tracking-tight mb-2">Nova redação</h1>
      <p className="text-neutral-500 mb-6">
        Corrigida pelos 5 critérios do INEP em segundos pela IA.
      </p>

      {/* Seletor de modo */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-2xl mb-6">
        <button
          onClick={() => setModo("sugerido")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition ${
            modo === "sugerido"
              ? "bg-white shadow-sm text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Lightbulb className="w-4 h-4" /> Tema sugerido
        </button>
        <button
          onClick={() => setModo("livre")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition ${
            modo === "livre"
              ? "bg-white shadow-sm text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Pencil className="w-4 h-4" /> Tema livre
        </button>
      </div>

      <div className="space-y-5">
        {modo === "sugerido" ? (
          <div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 mb-1.5">
              <label className="min-w-0 text-xs font-bold uppercase tracking-wider text-neutral-500 truncate">
                Tema indicado pelo sistema
              </label>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                {isPro ? "Pro" : "Tema do dia"}
              </span>
            </div>

            <div className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50">
              <p className="font-bold text-neutral-900 break-words">
                {temaSelecionado.titulo}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">{temaSelecionado.eixo}</p>
            </div>

            <div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-100 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
                Proposta
              </p>
              <p className="text-sm text-indigo-900 leading-relaxed">
                {temaSelecionado.descricao}
              </p>
            </div>

            {isPro ? (
              <button
                type="button"
                onClick={() => {
                  const novo = sortearTemaInedito(temasFeitos, temaSelecionado.titulo);
                  if (!novo) {
                    toast.info("Você já recebeu todos os temas disponíveis.");
                    return;
                  }
                  setTemaSelecionado(novo);
                }}
                disabled={todosFeitos}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-neutral-200 hover:border-neutral-900 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shuffle className="w-3.5 h-3.5" /> Sortear outro tema
              </button>
            ) : (
              <div className="mt-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-amber-900">
                    Quer sortear outros temas?
                  </p>
                  <p className="text-xs text-amber-800 mt-1">
                    No plano Free, o sistema indica um tema por dia. No Pro, sorteie
                    quantos temas quiser da biblioteca de {TEMAS.length} propostas no
                    estilo ENEM.
                  </p>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center mt-3 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                  >
                    Ver planos
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
              Tema
            </label>
            <input
              value={temaLivre}
              onChange={(e) => setTemaLivre(e.target.value)}
              placeholder="Ex.: Desafios da educação digital no Brasil"
              className="w-full h-12 px-4 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
            Sua redação
          </label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva sua redação dissertativo-argumentativa…"
            rows={20}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif leading-relaxed"
          />
          <div className="flex justify-between mt-2 text-xs text-neutral-500 font-medium">
            <span>
              {palavras} palavras · {linhas} linhas
            </span>
            <span>{texto.length} caracteres</span>
          </div>
        </div>

        {!isPro && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900">
                Plano gratuito: 1 correção por dia
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Você tem direito a uma correção com IA por dia. Para correções ilimitadas,
                assine o plano Pro.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCorrigir}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? "Corrigindo…" : "Corrigir com IA"}
          </button>
          <button
            onClick={handleSalvarRascunho}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border-2 border-neutral-200 hover:border-neutral-900 px-6 py-3 rounded-2xl text-sm font-bold"
          >
            Salvar rascunho
          </button>
        </div>
      </div>
    </div>
  );
}
