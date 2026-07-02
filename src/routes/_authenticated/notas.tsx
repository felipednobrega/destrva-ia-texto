import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notas")({
  component: NotasPage,
});

function NotasPage() {
  const qc = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["notas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });

  async function adicionar() {
    if (saving) return;
    const t = titulo.trim();
    const c = conteudo.trim();
    if (!t) {
      toast.error("Dê um título à nota antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        toast.error("Sessão expirada. Entre novamente para salvar.");
        return;
      }
      const { error } = await supabase
        .from("notas")
        .insert({ user_id: userRes.user.id, titulo: t, conteudo: c || null });
      if (error) {
        toast.error(`Não foi possível salvar: ${error.message}`);
        return;
      }
      setTitulo("");
      setConteudo("");
      await qc.invalidateQueries({ queryKey: ["notas"] });
      toast.success("Nota salva e sincronizada");
    } finally {
      setSaving(false);
    }
  }

  async function remover(id: string) {
    const prev = qc.getQueryData<typeof data>(["notas"]);
    qc.setQueryData(["notas"], (old: typeof data) =>
      (old ?? []).filter((n) => n.id !== id),
    );
    const { error } = await supabase.from("notas").delete().eq("id", id);
    if (error) {
      qc.setQueryData(["notas"], prev);
      toast.error(`Não foi possível excluir: ${error.message}`);
    } else {
      qc.invalidateQueries({ queryKey: ["notas"] });
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black tracking-tight mb-2">Notas</h1>
      <p className="text-neutral-500 mb-8">
        Anote temas, repertórios e ideias para suas próximas redações.
      </p>

      <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título da nota"
          className="w-full font-bold text-lg mb-3 focus:outline-none"
        />
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="Escreva aqui suas ideias, repertórios, citações…"
          rows={4}
          className="w-full text-sm leading-relaxed focus:outline-none resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={adicionar}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600">Erro ao carregar notas. Recarregue a página.</p>
      ) : isLoading ? (
        <p className="text-sm text-neutral-500">Carregando…</p>
      ) : (data ?? []).length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma nota ainda.</p>
      ) : (
        <div className="grid gap-3">
          {data!.map((n) => (
            <div key={n.id} className="bg-white border border-neutral-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-bold">{n.titulo}</h3>
                <button
                  onClick={() => remover(n.id)}
                  className="text-neutral-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {n.conteudo && (
                <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  {n.conteudo}
                </p>
              )}
              <p className="text-xs text-neutral-400 mt-2">
                {new Date(n.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
