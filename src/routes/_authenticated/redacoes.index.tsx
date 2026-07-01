import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/redacoes/")({
  component: RedacoesPage,
});

function RedacoesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["redacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("redacoes")
        .select("id, tema, nota_total, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Minhas redações</h1>
          <p className="text-neutral-500 mt-1">Todas as suas redações em um só lugar</p>
        </div>
        <Link
          to="/redacoes/nova"
          className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-800"
        >
          <Plus className="w-4 h-4" /> Nova redação
        </Link>
      </div>

      {isLoading ? (
        <p className="text-neutral-500">Carregando…</p>
      ) : (data ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
          <p className="font-bold mb-1">Nenhuma redação ainda</p>
          <p className="text-sm text-neutral-500 mb-4">
            Escreva sua primeira redação e receba correção da IA em segundos.
          </p>
          <Link
            to="/redacoes/nova"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold"
          >
            <Plus className="w-4 h-4" /> Começar agora
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {data!.map((r) => (
            <Link
              key={r.id}
              to="/redacoes/$id"
              params={{ id: r.id }}
              className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-900 transition-colors flex items-center justify-between"
            >
              <div className="min-w-0 mr-4">
                <h3 className="font-bold truncate">{r.tema}</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(r.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="text-right shrink-0">
                {r.status === "corrigida" ? (
                  <>
                    <div className="text-2xl font-black">{r.nota_total}</div>
                    <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                      /1000
                    </div>
                  </>
                ) : r.status === "corrigindo" ? (
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                    Corrigindo…
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-1 bg-neutral-100 rounded-full">
                    Rascunho
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
