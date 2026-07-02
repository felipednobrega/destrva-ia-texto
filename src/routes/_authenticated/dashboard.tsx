import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  TrendingUp,
  StickyNote,
  Plus,
  Sparkles,
  Lock,
  Flame,
  Target,
  Lightbulb,
  Pencil,
  Trophy,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Clock,
  Crown,
  PenLine,
  CheckCircle2,
  Rocket,
} from "lucide-react";
import { usePlano } from "@/hooks/usePlano";
import { getTemaDoDiaParaUsuario } from "@/lib/temas";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type RedacaoRow = {
  id: string;
  tema: string;
  texto: string | null;
  nota_total: number | null;
  status: string;
  created_at: string;
  corrigida_em: string | null;
  c1: number | null;
  c2: number | null;
  c3: number | null;
  c4: number | null;
  c5: number | null;
  feedback: string | null;
  comentarios: unknown;
};

const COMP_LABELS = ["C1", "C2", "C3", "C4", "C5"] as const;
const COMP_FULL: Record<string, string> = {
  C1: "Norma culta",
  C2: "Compreensão do tema",
  C3: "Argumentação",
  C4: "Coesão",
  C5: "Proposta de intervenção",
};

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const set = new Set(
    dates.map((d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x.getTime();
    }),
  );
  let streak = 0;
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  // se não escreveu hoje, tenta a partir de ontem
  if (!set.has(cur.getTime())) cur.setDate(cur.getDate() - 1);
  while (set.has(cur.getTime())) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

function stripAccents(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

type RecurringError = {
  label: string;
  count: number;
  total: number;
  comp: "C1" | "C2" | "C3" | "C4" | "C5";
  tip: string;
};

function extractRecurringErrors(redacoes: RedacaoRow[]): RecurringError[] {
  // Heurística: normaliza (sem acento, minúsculo), busca padrões e agrupa por competência.
  type Entry = { label: string; comp: RecurringError["comp"]; tip: string };
  const KEYWORDS: Array<[string, Entry]> = [
    ["crase", { label: "Crase", comp: "C1", tip: "Revise regras de crase antes de 'a' + palavra feminina." }],
    ["concordancia", { label: "Concordância", comp: "C1", tip: "Confira sujeito↔verbo e nome↔adjetivo em cada frase." }],
    ["regencia", { label: "Regência", comp: "C1", tip: "Cheque preposições exigidas pelos verbos (assistir a, obedecer a…)." }],
    ["pontuacao", { label: "Pontuação", comp: "C1", tip: "Leia em voz alta: onde pausa, geralmente há vírgula ou ponto." }],
    ["virgula", { label: "Vírgula", comp: "C1", tip: "Evite vírgula entre sujeito e verbo; use em apostos e adjuntos deslocados." }],
    ["ortografia", { label: "Ortografia", comp: "C1", tip: "Duplique a revisão de palavras com 's/ss', 'ç', 'x/ch'." }],
    ["acentuacao", { label: "Acentuação", comp: "C1", tip: "Reforce oxítonas, paroxítonas e monossílabos tônicos." }],
    ["norma culta", { label: "Norma culta", comp: "C1", tip: "Evite gírias e coloquialismos; prefira registro formal." }],
    ["informalidade", { label: "Informalidade", comp: "C1", tip: "Troque 'a gente' por 'nós' e evite expressões da fala." }],
    ["fuga ao tema", { label: "Fuga ao tema", comp: "C2", tip: "Volte à palavra-chave do tema em cada parágrafo." }],
    ["tangenciamento", { label: "Tangenciamento", comp: "C2", tip: "Aborde o recorte específico do tema, não o assunto genérico." }],
    ["repertorio", { label: "Repertório", comp: "C2", tip: "Traga 1 repertório produtivo por parágrafo (autor, dado, obra)." }],
    ["tese", { label: "Tese", comp: "C3", tip: "Termine a introdução com uma tese clara e defensável." }],
    ["argument", { label: "Argumentação", comp: "C3", tip: "Cada parágrafo: tópico frasal → dado/exemplo → arremate." }],
    ["senso comum", { label: "Senso comum", comp: "C3", tip: "Substitua clichês por dados, autores ou fatos concretos." }],
    ["coesao", { label: "Coesão", comp: "C4", tip: "Varie conectivos: ademais, por conseguinte, sob essa ótica…" }],
    ["conectivo", { label: "Conectivos", comp: "C4", tip: "Comece cada parágrafo com um conectivo diferente." }],
    ["repeticao", { label: "Repetição", comp: "C4", tip: "Use sinônimos e retomadas pronominais para evitar repetições." }],
    ["paragrafa", { label: "Paragrafação", comp: "C4", tip: "Um parágrafo = uma ideia central bem desenvolvida." }],
    ["clareza", { label: "Clareza", comp: "C4", tip: "Frases curtas: sujeito + verbo + complemento." }],
    ["proposta", { label: "Proposta de intervenção", comp: "C5", tip: "Inclua os 5 elementos: agente, ação, meio, efeito e detalhamento." }],
    ["intervencao", { label: "Proposta de intervenção", comp: "C5", tip: "Detalhe COMO o agente executará a ação proposta." }],
    ["agente", { label: "Agente da proposta", comp: "C5", tip: "Nomeie um agente concreto (Ministério, ONG, escola…)." }],
    ["detalhamento", { label: "Detalhamento da proposta", comp: "C5", tip: "Explique modo/meio e efeito esperado da intervenção." }],
  ];
  const counts = new Map<string, { count: number; entry: Entry }>();
  for (const r of redacoes) {
    const blob =
      (r.feedback ?? "") +
      " " +
      (r.comentarios ? JSON.stringify(r.comentarios) : "");
    const norm = stripAccents(blob.toLowerCase());
    const hits = new Map<string, Entry>();
    for (const [needle, entry] of KEYWORDS) {
      if (norm.includes(needle)) hits.set(entry.label, entry);
    }
    for (const [label, entry] of hits) {
      const cur = counts.get(label);
      counts.set(label, { count: (cur?.count ?? 0) + 1, entry });
    }
  }
  const total = redacoes.length;
  return [...counts.values()]
    .filter((v) => v.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((v) => ({
      label: v.entry.label,
      comp: v.entry.comp,
      tip: v.entry.tip,
      count: v.count,
      total,
    }));
}


type StudyPlan = {
  titulo: string;
  foco: string;
  acoes: string[];
  recursos: { label: string; hint: string }[];
  meta: string;
};

function studyPlan(weakest: string | null, mediaComp: number): StudyPlan {
  if (!weakest) {
    return {
      titulo: "Comece sua jornada",
      foco: "Sem dados suficientes",
      acoes: [
        "Escreva sua primeira redação usando um tema recente do ENEM.",
        "Peça a correção pela IA para descobrir seus pontos fracos.",
        "Volte aqui para receber um plano personalizado por competência.",
      ],
      recursos: [
        { label: "Cartilha do participante ENEM", hint: "critérios oficiais das 5 competências" },
        { label: "Banco de temas", hint: "escolha um tema para praticar hoje" },
      ],
      meta: "Meta inicial: 1 redação nesta semana.",
    };
  }
  const base: Record<string, StudyPlan> = {
    C1: {
      titulo: "Domínio da norma culta",
      foco: "Gramática, ortografia e pontuação",
      acoes: [
        "Revise crase, concordância verbal/nominal e regência dos 10 verbos mais usados.",
        "Reescreva 1 parágrafo antigo aplicando pontuação correta (vírgula, ponto e vírgula, dois-pontos).",
        "Leia sua redação em voz alta antes de enviar — o ouvido pega deslizes que o olho não vê.",
      ],
      recursos: [
        { label: "Nova Gramática do Português Contemporâneo", hint: "consulta rápida de regras" },
        { label: "Guia de pontuação da FGV", hint: "PDF gratuito, 20 min de leitura" },
      ],
      meta: "Meta: reduzir erros gramaticais em 50% nas próximas 3 redações.",
    },
    C2: {
      titulo: "Compreensão do tema e repertório",
      foco: "Tipologia dissertativo-argumentativa + repertório",
      acoes: [
        "Antes de escrever, resuma o tema em 1 frase e liste 3 palavras-chave.",
        "Monte um repertório de 5 fontes produtivas (filósofos, dados IBGE, obras literárias, leis).",
        "Evite tangenciamento: cada parágrafo deve citar explicitamente a palavra-chave do tema.",
      ],
      recursos: [
        { label: "Repertório coringa (Descomplica)", hint: "10 citações que servem para vários temas" },
        { label: "Agenda 2030 da ONU", hint: "17 ODS = repertório atual para qualquer tema social" },
      ],
      meta: "Meta: usar pelo menos 2 repertórios legitimados por redação.",
    },
    C3: {
      titulo: "Argumentação consistente",
      foco: "Seleção e organização de argumentos",
      acoes: [
        "Estruture cada parágrafo em: tópico frasal → dado/exemplo → análise → arremate.",
        "Traga 1 argumento causal e 1 argumento consequencial (evita repetir a mesma ideia).",
        "Cite fatos concretos: número, ano, autor ou lei. Argumentação vaga perde nota.",
      ],
      recursos: [
        { label: "Modelo Toulmin de argumentação", hint: "tese, dado, garantia, refutação" },
        { label: "Redações nota 1000 do ENEM", hint: "analise como organizam os parágrafos" },
      ],
      meta: "Meta: 2 argumentos distintos e bem desenvolvidos por redação.",
    },
    C4: {
      titulo: "Coesão textual",
      foco: "Conectivos e referenciação",
      acoes: [
        "Comece cada parágrafo com um conectivo diferente (ademais, outrossim, por conseguinte, sob essa ótica).",
        "Use pronomes e sinônimos para retomar ideias — evite repetir o mesmo substantivo.",
        "Faça uma tabela pessoal com 20 conectivos organizados por função (adição, oposição, causa).",
      ],
      recursos: [
        { label: "Lista de conectivos (Brasil Escola)", hint: "organizada por relação lógica" },
        { label: "Exercícios de coesão referencial", hint: "pratique retomadas" },
      ],
      meta: "Meta: 0 repetição de conectivo dentro da mesma redação.",
    },
    C5: {
      titulo: "Proposta de intervenção completa",
      foco: "Os 5 elementos + direitos humanos",
      acoes: [
        "Toda proposta precisa de: agente, ação, modo/meio, efeito e detalhamento.",
        "Escolha agentes diversos (Ministério da Educação, ONGs, escolas, mídia) — evite só 'o governo'.",
        "Detalhe o modo/meio com verbo específico: 'por meio de campanhas em redes sociais com influenciadores…'",
      ],
      recursos: [
        { label: "Guia dos 5 elementos (Imaginie)", hint: "checklist para conferir sua proposta" },
        { label: "Declaração Universal dos Direitos Humanos", hint: "leitura de 15 min" },
      ],
      meta: "Meta: proposta com os 5 elementos identificáveis em cada redação.",
    },
  };
  const plan = base[weakest] ?? base.C1;
  const gap = Math.max(0, 200 - mediaComp);
  return {
    ...plan,
    foco: `${plan.foco} · média atual ${mediaComp}/200${gap > 0 ? ` (+${gap} possíveis)` : ""}`,
  };
}

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function primeiroNome(u: { user_metadata?: { full_name?: string; name?: string }; email?: string | null } | null | undefined) {
  if (!u) return "";
  const full = u.user_metadata?.full_name ?? u.user_metadata?.name ?? "";
  if (full) return full.split(" ")[0];
  if (u.email) return u.email.split("@")[0];
  return "";
}

function DashboardPage() {
  const { isPro } = usePlano();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-v2"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const userId = u.user?.id;
      const inicioDoDia = new Date();
      inicioDoDia.setHours(0, 0, 0, 0);
      const [
        { data: ultimas },
        { count: totalRedacoes },
        { count: totalNotas },
        { data: corrigidasAll },
        { data: todasDatas },
        { data: rascunho },
        { count: corrigidasHoje },
      ] = await Promise.all([
        supabase
          .from("redacoes")
          .select(
            "id, tema, nota_total, status, created_at, corrigida_em, c1, c2, c3, c4, c5, feedback, comentarios",
          )
          .eq("status", "corrigida")
          .order("corrigida_em", { ascending: false })
          .limit(10),
        supabase.from("redacoes").select("id", { count: "exact", head: true }),
        supabase.from("notas").select("id", { count: "exact", head: true }),
        supabase
          .from("redacoes")
          .select(
            "id, tema, nota_total, c1, c2, c3, c4, c5, feedback, comentarios, corrigida_em, status, created_at",
          )
          .eq("status", "corrigida")
          .not("nota_total", "is", null),
        supabase.from("redacoes").select("created_at"),
        supabase
          .from("redacoes")
          .select("id, tema, created_at, status")
          .eq("status", "rascunho")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("redacoes")
          .select("id", { count: "exact", head: true })
          .gte("corrigida_em", inicioDoDia.toISOString()),
      ]);

      const corr = (corrigidasAll ?? []) as RedacaoRow[];
      const notas = corr.map((r) => r.nota_total ?? 0);
      const media =
        notas.length > 0
          ? Math.round(notas.reduce((s, n) => s + n, 0) / notas.length)
          : 0;

      // Médias por competência
      const compMedias = COMP_LABELS.map((label) => {
        const key = label.toLowerCase() as "c1" | "c2" | "c3" | "c4" | "c5";
        const vals = corr.map((r) => r[key] ?? 0).filter((v) => v > 0);
        const avg = vals.length
          ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
          : 0;
        return { competencia: label, nome: COMP_FULL[label], media: avg };
      });
      const fracas = compMedias.filter((c) => c.media > 0);
      const weakest =
        fracas.length > 0
          ? fracas.reduce((a, b) => (a.media <= b.media ? a : b)).competencia
          : null;

      // Evolução (até 10 corrigidas em ordem cronológica)
      const evolucao = [...corr]
        .sort(
          (a, b) =>
            new Date(a.corrigida_em ?? a.created_at).getTime() -
            new Date(b.corrigida_em ?? b.created_at).getTime(),
        )
        .slice(-10)
        .map((r, i) => ({
          idx: i + 1,
          data: new Date(r.corrigida_em ?? r.created_at).toLocaleDateString(
            "pt-BR",
            { day: "2-digit", month: "2-digit" },
          ),
          nota: r.nota_total ?? 0,
        }));

      // Melhor e pior
      const melhor =
        corr.length > 0
          ? corr.reduce((a, b) => ((a.nota_total ?? 0) >= (b.nota_total ?? 0) ? a : b))
          : null;
      const pior =
        corr.length > 0
          ? corr.reduce((a, b) => ((a.nota_total ?? 0) <= (b.nota_total ?? 0) ? a : b))
          : null;

      // Streak
      const streak = computeStreak(
        ((todasDatas ?? []) as { created_at: string }[]).map((r) => r.created_at),
      );

      // Erros recorrentes
      const erros = extractRecurringErrors(corr);

      // Tema do dia (sem repetir já feitos)
      const titulosFeitos = corr.map((r) => r.tema);
      const temaDia = userId ? getTemaDoDiaParaUsuario(titulosFeitos) : null;

      return {
        ultimas: (ultimas ?? []) as RedacaoRow[],
        media,
        total: totalRedacoes ?? 0,
        notasCount: totalNotas ?? 0,
        compMedias,
        weakest,
        evolucao,
        melhor,
        pior,
        streak,
        erros,
        rascunho,
        temaDia,
        corrigidasHoje: corrigidasHoje ?? 0,
        nome: primeiroNome(u.user),
      };
    },
  });

  const ehNovato = !isLoading && (data?.total ?? 0) === 0;

  return (
    <div className="px-4 py-6 sm:p-8 max-w-6xl mx-auto">
      {/* Header com saudação */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate">
              {saudacao()}{data?.nome ? `, ${data.nome}` : ""} 👋
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                isPro
                  ? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {isPro ? <Sparkles className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {isPro ? "Pro" : "Free"}
            </span>
          </div>
          <p className="text-sm sm:text-base text-neutral-500">
            {ehNovato
              ? "Pronto para sua primeira redação? Vamos lá!"
              : "Acompanhe sua evolução rumo aos 900+"}
          </p>
        </div>
        <Link
          to="/redacoes/nova"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-sm font-bold hover:opacity-90 shadow-lg shadow-indigo-200 shrink-0"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nova redação</span>
          <span className="sm:hidden">Nova</span>
        </Link>
      </header>

      {isLoading && (
        <div className="space-y-4 animate-pulse mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-40 rounded-2xl bg-neutral-100" />
            <div className="h-40 rounded-2xl bg-neutral-100" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-neutral-100" />
            ))}
          </div>
        </div>
      )}

      {ehNovato && (
        <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-indigo-600" />
            <h2 className="font-black text-lg">Como funciona</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <OnboardingStep n={1} icon={<Lightbulb className="w-5 h-5" />} title="Escolha um tema" desc="Use o tema do dia ou um da nossa biblioteca." />
            <OnboardingStep n={2} icon={<PenLine className="w-5 h-5" />} title="Escreva sua redação" desc="Dissertativo-argumentativo, até 30 linhas." />
            <OnboardingStep n={3} icon={<CheckCircle2 className="w-5 h-5" />} title="Receba a correção" desc="Nota por competência e feedback da IA." />
          </div>
          <Link
            to="/redacoes/nova"
            className="mt-6 inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-800"
          >
            Começar minha primeira redação <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}


      {/* Plano + limite diário */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PlanoCard isPro={isPro} corrigidasHoje={data?.corrigidasHoje ?? 0} />
        {!isPro && (data?.corrigidasHoje ?? 0) >= 1 && <ProximaRedacaoCard />}
      </div>


      {/* Ações rápidas: rascunho + tema do dia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {data?.rascunho ? (
          <Link
            to="/redacoes/nova"
            className="group rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 hover:border-amber-300 transition"
          >
            <div className="flex items-center gap-2 text-amber-700 text-xs uppercase tracking-wider font-bold mb-2">
              <Pencil className="w-4 h-4" /> Continuar rascunho
            </div>
            <p className="font-bold line-clamp-2">{data.rascunho.tema}</p>
            <p className="text-xs text-neutral-500 mt-2">
              Iniciado em{" "}
              {new Date(data.rascunho.created_at).toLocaleDateString("pt-BR")}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-700 mt-3 group-hover:gap-2 transition-all">
              Retomar <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-2 text-neutral-500 text-xs uppercase tracking-wider font-bold mb-2">
              <Pencil className="w-4 h-4" /> Rascunhos
            </div>
            <p className="text-sm text-neutral-500">
              Nenhum rascunho em aberto. Tudo enviado para correção. ✓
            </p>
          </div>
        )}

        {data?.temaDia && (
          <Link
            to="/redacoes/nova"
            className="group rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-fuchsia-50 p-5 hover:border-indigo-300 transition"
          >
            <div className="flex items-center gap-2 text-indigo-700 text-xs uppercase tracking-wider font-bold mb-2">
              <Lightbulb className="w-4 h-4" /> Tema do dia
            </div>
            <p className="font-bold line-clamp-2">{data.temaDia.titulo}</p>
            <p className="text-xs text-neutral-600 mt-2 line-clamp-2">
              {data.temaDia.descricao}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700 mt-3 group-hover:gap-2 transition-all">
              Começar agora <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        )}
      </div>

      {/* Stats principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat icon={<FileText className="w-4 h-4" />} label="Redações" value={String(data?.total ?? 0)} />
        <Stat
          icon={<TrendingUp className="w-4 h-4" />}
          label="Nota média"
          value={data?.media ? String(data.media) : "—"}
        />
        <Stat
          icon={<Flame className="w-4 h-4" />}
          label="Sequência"
          value={`${data?.streak ?? 0}d`}
          accent={data && data.streak > 0 ? "fire" : undefined}
        />
        <Stat icon={<StickyNote className="w-4 h-4" />} label="Notas" value={String(data?.notasCount ?? 0)} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Evolução */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h2 className="font-bold">Evolução da nota</h2>
          </div>
          {!data?.evolucao.length ? (
            <p className="text-sm text-neutral-500 py-8 text-center">
              Corrija sua primeira redação para ver a evolução.
            </p>
          ) : (
            <div className="h-56 sm:h-64 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.evolucao} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                  <XAxis dataKey="data" fontSize={11} stroke="#999" />
                  <YAxis domain={[0, 1000]} fontSize={11} stroke="#999" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e5e5e5", fontSize: 12 }}
                    formatter={(v: number) => [`${v}/1000`, "Nota"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="nota"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#4f46e5" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Competências */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Target className="w-4 h-4 text-fuchsia-600" />
            <h2 className="font-bold">Desempenho por competência</h2>
            {data?.weakest && (
              <span className="ml-auto text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 px-2 py-1 rounded-full">
                Foco: {data.weakest}
              </span>
            )}
          </div>
          {!data?.compMedias.some((c) => c.media > 0) ? (
            <p className="text-sm text-neutral-500 py-8 text-center">
              Corrija redações para ver suas competências.
            </p>
          ) : (
            <div className="h-56 sm:h-64 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.compMedias} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                  <XAxis dataKey="competencia" fontSize={11} stroke="#999" />
                  <YAxis domain={[0, 200]} fontSize={11} stroke="#999" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e5e5e5", fontSize: 12 }}
                    formatter={(v: number, _n, p: { payload?: { nome?: string } }) => [
                      `${v}/200`,
                      p?.payload?.nome ?? "",
                    ]}
                  />
                  <Bar dataKey="media" radius={[8, 8, 0, 0]}>
                    {data.compMedias.map((c) => (
                      <Cell
                        key={c.competencia}
                        fill={c.competencia === data.weakest ? "#ef4444" : "#a855f7"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Insights de IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <h2 className="font-bold">Erros recorrentes</h2>
            </div>
            {!!data?.erros.length && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Top {data.erros.length}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mb-3">
            Padrões detectados nas suas últimas correções.
          </p>
          {!data?.erros.length ? (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center">
              <p className="text-sm text-neutral-500">
                Ainda não há padrões. Corrija mais redações para descobrir seus erros mais comuns.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.erros.map((e, i) => {
                const pct = e.total > 0 ? Math.round((e.count / e.total) * 100) : 0;
                return (
                  <li
                    key={e.label}
                    className="group p-3 rounded-xl bg-orange-50/70 border border-orange-100 hover:border-orange-200 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center w-7 h-7 rounded-full bg-orange-600 text-white text-xs font-black shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm truncate">{e.label}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-600/10 text-orange-700">
                            {e.comp}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {e.count} de {e.total} redações · {pct}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-orange-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                        style={{ width: `${Math.max(pct, 6)}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-600 mt-2 leading-snug">
                      <span className="font-semibold text-neutral-700">Dica:</span> {e.tip}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>


        {(() => {
          const mediaWeak =
            data?.compMedias?.find((c) => c.competencia === data?.weakest)?.media ?? 0;
          const plan = studyPlan(data?.weakest ?? null, mediaWeak);
          return (
            <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-fuchsia-50 p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="w-4 h-4 text-indigo-700 shrink-0" />
                  <h2 className="font-bold truncate">Plano de estudo personalizado</h2>
                </div>
                {data?.weakest && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-indigo-600 text-white shrink-0">
                    {data.weakest}
                  </span>
                )}
              </div>

              <p className="text-sm font-bold text-indigo-900 leading-snug">{plan.titulo}</p>
              <p className="text-xs text-indigo-700/80 mb-4">{plan.foco}</p>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-3.5 h-3.5 text-indigo-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Ações desta semana
                  </h3>
                </div>
                <ul className="space-y-2">
                  {plan.acoes.map((a, i) => (
                    <li key={i} className="flex gap-2 text-sm text-neutral-700 leading-snug">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-white border border-indigo-300 text-indigo-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.recursos.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                      Recursos sugeridos
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {plan.recursos.map((r, i) => (
                      <li key={i} className="text-xs text-neutral-700">
                        <span className="font-semibold text-neutral-800">{r.label}</span>
                        <span className="text-neutral-500"> — {r.hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-start gap-2 rounded-lg bg-white/70 border border-indigo-200 p-2.5 mb-4">
                <Rocket className="w-3.5 h-3.5 text-indigo-700 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-900 font-medium leading-snug">{plan.meta}</p>
              </div>

              <Link
                to="/redacoes/nova"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900"
              >
                Praticar agora <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })()}
      </div>

      {/* Melhor e pior */}
      {data?.melhor && data?.pior && data.melhor.id !== data.pior.id && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link
            to="/redacoes/$id"
            params={{ id: data.melhor.id }}
            className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 hover:border-emerald-300 transition"
          >
            <div className="flex items-center gap-2 text-emerald-700 text-xs uppercase tracking-wider font-bold mb-2">
              <Trophy className="w-4 h-4" /> Sua melhor
            </div>
            <p className="font-bold line-clamp-2">{data.melhor.tema}</p>
            <p className="text-2xl font-black mt-2 text-emerald-700">
              {data.melhor.nota_total}
              <span className="text-sm text-emerald-600">/1000</span>
            </p>
          </Link>
          <Link
            to="/redacoes/$id"
            params={{ id: data.pior.id }}
            className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 hover:border-red-300 transition"
          >
            <div className="flex items-center gap-2 text-red-700 text-xs uppercase tracking-wider font-bold mb-2">
              <AlertTriangle className="w-4 h-4" /> A revisitar
            </div>
            <p className="font-bold line-clamp-2">{data.pior.tema}</p>
            <p className="text-2xl font-black mt-2 text-red-700">
              {data.pior.nota_total}
              <span className="text-sm text-red-600">/1000</span>
            </p>
          </Link>
        </div>
      )}

      {/* Últimas correções */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
        <h2 className="font-bold mb-4">Últimas correções</h2>
        {isLoading ? (
          <p className="text-sm text-neutral-500">Carregando...</p>
        ) : (data?.ultimas ?? []).length === 0 ? (
          <p className="text-sm text-neutral-500">
            Nenhuma redação corrigida ainda.{" "}
            <Link to="/redacoes/nova" className="text-indigo-600 font-bold">
              Comece a primeira →
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {data!.ultimas.slice(0, 3).map((r) => (
              <li
                key={r.id}
                className="py-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
              >
                <Link
                  to="/redacoes/$id"
                  params={{ id: r.id }}
                  className="font-medium hover:underline truncate min-w-0"
                >
                  {r.tema}
                </Link>
                <span className="text-sm font-bold shrink-0">
                  {r.nota_total}/1000
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function OnboardingStep({
  n,
  icon,
  title,
  desc,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bg-white/70 border border-indigo-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="grid place-items-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black shrink-0">
          {n}
        </span>
        <span className="text-indigo-600">{icon}</span>
      </div>
      <p className="font-bold text-sm">{title}</p>
      <p className="text-xs text-neutral-600 mt-1">{desc}</p>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: "fire";
}) {
  return (
    <div
      className={`border rounded-2xl p-3 sm:p-5 ${
        accent === "fire"
          ? "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
          : "bg-white border-neutral-200"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-1.5 sm:mb-2 ${
          accent === "fire" ? "text-orange-700" : "text-neutral-500"
        }`}
      >
        {icon} <span className="truncate">{label}</span>
      </div>
      <div
        className={`text-2xl sm:text-3xl font-black ${
          accent === "fire" ? "text-orange-700" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function PlanoCard({ isPro, corrigidasHoje }: { isPro: boolean; corrigidasHoje: number }) {
  const limite = isPro ? Infinity : 1;
  const usadas = Math.min(corrigidasHoje, isPro ? corrigidasHoje : limite);
  const pct = isPro ? 100 : Math.min(100, (corrigidasHoje / 1) * 100);

  return (
    <div
      className={`rounded-2xl border-2 p-5 ${
        isPro
          ? "border-indigo-200 bg-gradient-to-br from-indigo-50 to-fuchsia-50"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {isPro ? (
            <Crown className="w-4 h-4 text-indigo-700 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-neutral-500 shrink-0" />
          )}
          <span className="text-xs uppercase tracking-wider font-bold text-neutral-500 truncate">
            Seu plano
          </span>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isPro
              ? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {isPro ? "Pro" : "Free"}
        </span>
      </div>

      <p className="text-2xl sm:text-3xl font-black">
        {isPro ? (
          <>
            {corrigidasHoje} <span className="text-base font-bold text-neutral-500">hoje</span>
          </>
        ) : (
          <>
            {usadas}
            <span className="text-base font-bold text-neutral-500">/1 hoje</span>
          </>
        )}
      </p>
      <p className="text-xs text-neutral-500 mt-1">
        {isPro
          ? "Correções ilimitadas com IA."
          : usadas >= 1
            ? "Você usou sua correção gratuita de hoje."
            : "Você ainda pode corrigir 1 redação hoje."}
      </p>

      {!isPro && (
        <>
          <div className="mt-4 h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <Link
            to="/pricing"
            className="mt-4 inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-800"
          >
            <Sparkles className="w-3.5 h-3.5" /> Fazer upgrade
          </Link>
        </>
      )}
    </div>
  );
}

function ProximaRedacaoCard() {
  const [restante, setRestante] = useState(() => msAteMeiaNoite());

  useEffect(() => {
    const id = setInterval(() => setRestante(msAteMeiaNoite()), 1000);
    return () => clearInterval(id);
  }, []);

  const { h, m, s } = formatHMS(restante);

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-amber-700 shrink-0" />
        <span className="text-xs uppercase tracking-wider font-bold text-amber-700 truncate">
          Próxima redação em
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-xs">
        <TimeBox value={h} label="horas" />
        <TimeBox value={m} label="min" />
        <TimeBox value={s} label="seg" />
      </div>
      <p className="text-xs text-amber-800 mt-3">
        Ou desbloqueie agora com o Pro — correções ilimitadas.
      </p>
      <Link
        to="/pricing"
        className="mt-3 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
      >
        <Sparkles className="w-3.5 h-3.5" /> Liberar agora
      </Link>
    </div>
  );
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/70 border border-amber-200 px-2 py-2 text-center">
      <div className="text-xl sm:text-2xl font-black tabular-nums text-amber-900">{value}</div>
      <div className="text-[10px] uppercase tracking-wider font-bold text-amber-700">
        {label}
      </div>
    </div>
  );
}

function msAteMeiaNoite() {
  const agora = new Date();
  const fim = new Date(agora);
  fim.setHours(24, 0, 0, 0);
  return Math.max(0, fim.getTime() - agora.getTime());
}

function formatHMS(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { h: pad(h), m: pad(m), s: pad(s) };
}
