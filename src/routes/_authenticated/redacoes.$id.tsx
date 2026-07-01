import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { corrigirRedacao } from "@/lib/redacoes.functions";

export const Route = createFileRoute("/_authenticated/redacoes/$id")({
  component: RedacaoDetailPage,
});

function RedacaoDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const corrigir = useServerFn(corrigirRedacao);
  const [corrigindo, setCorrigindo] = useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["redacao", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("redacoes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function handleCorrigir() {
    setCorrigindo(true);
    try {
      await corrigir({ data: { redacaoId: id } });
      await refetch();
      await qc.invalidateQueries({ queryKey: ["corrigidasHoje"] });
      await qc.invalidateQueries({ queryKey: ["redacoes"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Redação corrigida!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setCorrigindo(false);
    }
  }

  async function handleExcluir() {
    if (!confirm("Excluir esta redação?")) return;
    const { error } = await supabase.from("redacoes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      qc.removeQueries({ queryKey: ["redacao", id] });
      await qc.invalidateQueries({ queryKey: ["redacoes"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      await qc.invalidateQueries({ queryKey: ["corrigidasHoje"] });
      router.navigate({ to: "/redacoes" });
    }

  }

  if (isLoading) return <div className="p-8 text-neutral-500">Carregando…</div>;
  if (!data) return <div className="p-8 text-neutral-500">Não encontrada.</div>;

  const comentarios = (data.comentarios ?? {}) as Record<string, string | string[]>;
  const sugestoes = (comentarios.sugestoes as string[]) ?? [];
  const competencias = [
    { k: "c1", n: data.c1, label: "C1 — Norma culta" },
    { k: "c2", n: data.c2, label: "C2 — Compreensão do tema" },
    { k: "c3", n: data.c3, label: "C3 — Argumentação" },
    { k: "c4", n: data.c4, label: "C4 — Mecanismos linguísticos" },
    { k: "c5", n: data.c5, label: "C5 — Proposta de intervenção" },
  ] as const;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <Link
        to="/redacoes"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight break-words">{data.tema}</h1>
          <p className="text-neutral-500 mt-1 text-sm">
            {new Date(data.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        {data.status === "corrigida" && (
          <div className="text-right shrink-0">
            <div className="text-4xl sm:text-5xl font-black">{data.nota_total}</div>
            <div className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold">
              de 1000
            </div>
          </div>
        )}
      </div>

      {data.status !== "corrigida" && (
        <button
          onClick={handleCorrigir}
          disabled={corrigindo}
          className="mb-8 inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-3 rounded-2xl text-sm font-bold disabled:opacity-50"
        >
          {corrigindo ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {corrigindo ? "Corrigindo…" : "Corrigir com IA"}
        </button>
      )}

      {data.status === "corrigida" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
            {competencias.map((c) => (
              <div key={c.k} className="bg-white border border-neutral-200 rounded-2xl p-4">
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                  {c.label}
                </div>
                <div className="text-2xl font-black mt-1">{c.n ?? "—"}</div>
                <div className="text-[10px] text-neutral-400 font-bold">/200</div>
              </div>
            ))}
          </div>

          {data.feedback && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
                Feedback geral
              </div>
              <p className="text-sm leading-relaxed text-neutral-800">{data.feedback}</p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {competencias.map((c) => {
              const com = comentarios[c.k];
              if (!com || Array.isArray(com)) return null;
              return (
                <div key={c.k} className="bg-white border border-neutral-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{c.label}</span>
                    <span className="font-black">{c.n}/200</span>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed">{com}</p>
                </div>
              );
            })}
          </div>

          {sugestoes.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                Como melhorar
              </div>
              <ul className="space-y-1.5 text-sm text-neutral-800">
                {sugestoes.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
          Sua redação
        </div>
        <p className="whitespace-pre-wrap font-serif leading-relaxed text-neutral-800">
          {data.texto}
        </p>
      </div>

      <button
        onClick={handleExcluir}
        className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-bold"
      >
        <Trash2 className="w-4 h-4" /> Excluir redação
      </button>
    </div>
  );
}
