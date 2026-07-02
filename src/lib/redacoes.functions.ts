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
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

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

    if (res.status === 429) throw new Error("Limite de IA atingido. Tente em instantes.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos no Lovable.");
    if (!res.ok) throw new Error(`Falha na IA (${res.status})`);

    const json = await res.json();
    const finishReason = json.choices?.[0]?.finish_reason;
    if (finishReason === "length") throw new Error("Resposta da IA foi truncada. Tente novamente.");
    const content: string = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: {
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
    try {
      // Strip ```json fences if the model wrapped the output
      const cleaned = content
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "");
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("Resposta da IA inválida");
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
