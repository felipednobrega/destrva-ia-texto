import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const CorrigirInput = z.object({
  redacaoId: z.string().uuid(),
});

const SYSTEM_PROMPT = `Você é um corretor oficial de redações do ENEM, treinado nos critérios do INEP. Avalie a redação dissertativo-argumentativa do candidato segundo as 5 competências, atribuindo nota de 0, 40, 80, 120, 160 ou 200 a cada competência.

COMPETÊNCIAS:
C1 – Domínio da norma culta da língua portuguesa.
C2 – Compreender o tema e aplicar conceitos de várias áreas para desenvolver o texto dissertativo-argumentativo em prosa.
C3 – Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista.
C4 – Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.
C5 – Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos (com agente, ação, modo/meio, efeito e detalhamento).

REGRAS DE ZERO: fuga ao tema, não atendimento ao tipo dissertativo-argumentativo, texto até 7 linhas, cópia de textos motivadores, desrespeito aos direitos humanos, parte deliberadamente desconectada do tema → atribuir 0 na(s) competência(s) cabível(eis) e justificar.

Retorne APENAS JSON válido no formato:
{
  "c1": 0|40|80|120|160|200,
  "c2": ...,
  "c3": ...,
  "c4": ...,
  "c5": ...,
  "nota_total": soma,
  "feedback": "parágrafo geral curto",
  "comentarios": {
    "c1": "justificativa breve com erros encontrados",
    "c2": "...",
    "c3": "...",
    "c4": "...",
    "c5": "..."
  },
  "sugestoes": ["dica 1", "dica 2", "dica 3"]
}`;

type CorrecaoIa = {
  c1: unknown;
  c2: unknown;
  c3: unknown;
  c4: unknown;
  c5: unknown;
  nota_total?: unknown;
  feedback?: unknown;
  comentarios?: Record<string, unknown>;
  sugestoes?: unknown;
};

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function notaPorFaixa(valor: number, faixas: [number, number, number, number, number]) {
  if (valor >= faixas[4]) return 200;
  if (valor >= faixas[3]) return 160;
  if (valor >= faixas[2]) return 120;
  if (valor >= faixas[1]) return 80;
  if (valor >= faixas[0]) return 40;
  return 0;
}

function gerarCorrecaoLocal(tema: string, texto: string): CorrecaoIa {
  const textoLimpo = texto.trim();
  const normalizado = normalizarTexto(textoLimpo);
  const palavras = normalizado.match(/[a-z0-9]+/g) ?? [];
  const frases = textoLimpo.split(/[.!?]+/).filter((frase) => frase.trim().length > 20);
  const paragrafos = textoLimpo.split(/\n\s*\n|\n/).filter((p) => p.trim().length > 40);
  const conectivos = [
    "portanto",
    "alem disso",
    "desse modo",
    "nesse sentido",
    "contudo",
    "entretanto",
    "por conseguinte",
    "assim",
    "logo",
    "dessa forma",
    "em primeiro lugar",
    "em segundo lugar",
  ];
  const proposta = ["governo", "estado", "ministerio", "escola", "midia", "sociedade", "familia"];
  const acao = ["deve", "devem", "promover", "criar", "implementar", "realizar", "fiscalizar", "investir"];
  const meio = ["por meio", "atraves", "mediante", "campanha", "programa", "politica publica", "palestra"];
  const efeito = ["a fim de", "para que", "com o objetivo", "visando", "consequentemente", "reduzir", "combater"];
  const temaTokens = normalizarTexto(tema).match(/[a-z0-9]{4,}/g) ?? [];
  const temaAderencia = temaTokens.filter((token) => normalizado.includes(token)).length;
  const conectivosUsados = conectivos.filter((item) => normalizado.includes(item)).length;
  const temProposta = proposta.some((item) => normalizado.includes(item));
  const temAcao = acao.some((item) => normalizado.includes(item));
  const temMeio = meio.some((item) => normalizado.includes(item));
  const temEfeito = efeito.some((item) => normalizado.includes(item));
  const temCitacao = /segundo|conforme|de acordo|constitui[cç][aã]o|onu|ibge|fil[oó]sofo|s[oó]ci[oó]logo/i.test(textoLimpo);
  const pontuacaoBasica = /[.!?]/.test(textoLimpo) && /,/.test(textoLimpo);

  if (palavras.length < 110) {
    return {
      c1: pontuacaoBasica ? 80 : 40,
      c2: temaAderencia > 0 ? 80 : 40,
      c3: 40,
      c4: conectivosUsados > 0 ? 80 : 40,
      c5: temProposta && temAcao ? 80 : 40,
      feedback:
        "Correção automática básica: o texto parece curto para o padrão ENEM, então a nota foi limitada. Desenvolva introdução, dois argumentos e uma intervenção completa.",
      comentarios: {
        c1: "Há indícios de estrutura linguística, mas a extensão reduzida dificulta avaliar domínio consistente da norma culta.",
        c2: temaAderencia > 0 ? "O tema aparece no texto, porém precisa ser desenvolvido com mais profundidade." : "A relação com o tema precisa ficar mais explícita.",
        c3: "A argumentação ainda está pouco desenvolvida; inclua repertório, causa, consequência e defesa clara do ponto de vista.",
        c4: "Use conectivos entre períodos e parágrafos para melhorar a progressão textual.",
        c5: "A proposta de intervenção precisa apresentar agente, ação, meio, efeito e detalhamento.",
      },
      sugestoes: [
        "Escreva pelo menos 4 parágrafos: introdução, dois desenvolvimentos e conclusão.",
        "Inclua repertório sociocultural conectado ao tema.",
        "Finalize com proposta de intervenção completa: agente, ação, meio, finalidade e detalhamento.",
      ],
    };
  }

  const c1 = notaPorFaixa((pontuacaoBasica ? 1 : 0) + (frases.length >= 6 ? 1 : 0) + (palavras.length >= 260 ? 1 : 0), [1, 2, 3, 4, 5]);
  const c2 = notaPorFaixa(temaAderencia + (temCitacao ? 1 : 0) + (paragrafos.length >= 4 ? 1 : 0), [1, 2, 3, 4, 5]);
  const c3 = notaPorFaixa((paragrafos.length >= 3 ? 1 : 0) + (frases.length >= 7 ? 1 : 0) + (temCitacao ? 1 : 0) + (palavras.length >= 320 ? 1 : 0), [1, 2, 3, 4, 5]);
  const c4 = notaPorFaixa(conectivosUsados + (paragrafos.length >= 4 ? 1 : 0), [1, 2, 3, 4, 5]);
  const c5 = notaPorFaixa([temProposta, temAcao, temMeio, temEfeito].filter(Boolean).length, [1, 2, 3, 4, 5]);

  return {
    c1,
    c2,
    c3,
    c4,
    c5,
    feedback:
      "Correção automática básica gerada sem consumir créditos de IA. Ela estima a nota por critérios estruturais do ENEM; quando a cota de IA estiver disponível, a análise ficará mais detalhada.",
    comentarios: {
      c1: pontuacaoBasica
        ? "O texto apresenta pontuação básica e organização frasal. Revise concordância, regência e precisão vocabular para elevar a competência."
        : "Reforce pontuação, períodos bem delimitados e revisão gramatical para demonstrar domínio da norma culta.",
      c2: temaAderencia >= 2
        ? "O texto mantém relação com o tema e tenta desenvolver a proposta. Aumente a profundidade do recorte temático."
        : "A abordagem do tema ainda precisa ficar mais direta, com palavras-chave e problematização mais evidentes.",
      c3: temCitacao
        ? "Há tentativa de sustentação argumentativa com repertório. Explique melhor a ligação entre repertório, causa e consequência."
        : "Inclua repertório sociocultural produtivo e desenvolva melhor os argumentos em defesa do ponto de vista.",
      c4: conectivosUsados >= 3
        ? "Há uso de conectivos, o que ajuda a progressão textual. Varie os operadores argumentativos e evite repetições."
        : "Use mais conectivos entre ideias e parágrafos para melhorar coesão e progressão argumentativa.",
      c5: temProposta && temAcao && temMeio && temEfeito
        ? "A intervenção apresenta elementos importantes. Acrescente detalhamento específico para se aproximar da nota máxima."
        : "Complete a intervenção com agente, ação, meio, efeito/finalidade e detalhamento concreto.",
    },
    sugestoes: [
      "Garanta uma tese clara na introdução e retome essa tese ao longo do texto.",
      "Em cada desenvolvimento, apresente causa ou consequência, repertório e análise própria.",
      "Na conclusão, escreva uma intervenção completa com agente, ação, meio, finalidade e detalhamento.",
    ],
  };
}

export const corrigirRedacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CorrigirInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Plano: Pro = ilimitado; Free = 1 correção por dia.
    const { data: perfil } = await supabase
      .from("profiles")
      .select("plano, plano_expira_em")
      .eq("id", userId)
      .maybeSingle();
    const isPro =
      perfil?.plano === "pro" &&
      (!perfil.plano_expira_em || new Date(perfil.plano_expira_em) > new Date());

    if (!isPro) {
      const inicioDoDia = new Date();
      inicioDoDia.setHours(0, 0, 0, 0);
      // Conta correções de hoje, ignorando a própria redação (permite recorrigir a mesma).
      const { count } = await supabase
        .from("redacoes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .neq("id", data.redacaoId)
        .gte("corrigida_em", inicioDoDia.toISOString());
      if ((count ?? 0) >= 1) {
        throw new Error(
          "Você já usou sua correção gratuita de hoje. Assine o plano Pro para correções ilimitadas.",
        );
      }
    }

    const { data: redacao, error } = await supabase
      .from("redacoes")
      .select("*")
      .eq("id", data.redacaoId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !redacao) throw new Error("Redação não encontrada");

    const apiKey = process.env.LOVABLE_API_KEY;
    let parsed: CorrecaoIa;

    if (!apiKey) {
      parsed = gerarCorrecaoLocal(redacao.tema, redacao.texto);
    } else {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": apiKey,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `TEMA: ${redacao.tema}\n\nREDAÇÃO DO ALUNO:\n${redacao.texto}`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (res.status === 402) {
        parsed = gerarCorrecaoLocal(redacao.tema, redacao.texto);
      } else {
        if (res.status === 429) throw new Error("Limite de IA atingido. Tente em instantes.");
        if (!res.ok) throw new Error(`Falha na IA (${res.status})`);

        const json = await res.json();
        const finishReason = json.choices?.[0]?.finish_reason;
        if (finishReason === "length") throw new Error("Resposta da IA foi truncada. Tente novamente.");
        const content: string = json.choices?.[0]?.message?.content ?? "{}";
        try {
          // Strip ```json fences if the model wrapped the output
          const cleaned = content
            .trim()
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "");
          parsed = JSON.parse(cleaned) as CorrecaoIa;
        } catch {
          throw new Error("Resposta da IA inválida");
        }
      }
    }

    // Normaliza nota de competência: aceita number ou string, arredonda ao múltiplo
    // de 40 válido (0,40,80,120,160,200). Evita NaN/strings quebrarem o UPDATE.
    const ALLOWED = [0, 40, 80, 120, 160, 200] as const;
    const normNota = (v: unknown): number => {
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) return 0;
      const clamped = Math.max(0, Math.min(200, n));
      return ALLOWED.reduce((best, cur) =>
        Math.abs(cur - clamped) < Math.abs(best - clamped) ? cur : best,
      );
    };
    const c1 = normNota(parsed.c1);
    const c2 = normNota(parsed.c2);
    const c3 = normNota(parsed.c3);
    const c4 = normNota(parsed.c4);
    const c5 = normNota(parsed.c5);
    // Sempre derivar da soma para garantir consistência com as competências exibidas.
    const nota_total = c1 + c2 + c3 + c4 + c5;

    const comentariosLimpos: Record<string, string> = {};
    if (parsed.comentarios && typeof parsed.comentarios === "object") {
      for (const [k, v] of Object.entries(parsed.comentarios)) {
        if (typeof v === "string") comentariosLimpos[k] = v;
      }
    }
    const sugestoes = Array.isArray(parsed.sugestoes)
      ? parsed.sugestoes.filter((s): s is string => typeof s === "string")
      : [];
    const feedback = typeof parsed.feedback === "string" ? parsed.feedback : null;

    const { error: upErr } = await supabase
      .from("redacoes")
      .update({
        c1,
        c2,
        c3,
        c4,
        c5,
        nota_total,
        feedback,
        comentarios: { ...comentariosLimpos, sugestoes },
        status: "corrigida",
        corrigida_em: new Date().toISOString(),
      })
      .eq("id", data.redacaoId)
      .eq("user_id", userId);
    if (upErr) throw new Error(upErr.message);

    return { ok: true, nota_total };
  });
