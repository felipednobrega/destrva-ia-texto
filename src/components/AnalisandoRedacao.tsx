import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const DURACAO_MS = 4_000;

const ETAPAS = [
  "Lendo sua redação...",
  "Avaliando domínio da norma culta...",
  "Analisando compreensão do tema...",
  "Verificando argumentação e coesão...",
  "Conferindo proposta de intervenção...",
  "Calculando nota final...",
];

export function AnalisandoRedacao() {
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    const inicio = Date.now();
    const id = setInterval(() => {
      setProgresso(Math.min(100, ((Date.now() - inicio) / DURACAO_MS) * 100));
    }, 100);
    return () => clearInterval(id);
  }, []);

  const etapaAtual =
    ETAPAS[Math.min(ETAPAS.length - 1, Math.floor((progresso / 100) * ETAPAS.length))];

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="relative mx-auto mb-6 w-20 h-20">
          <div className="absolute inset-0 rounded-3xl bg-indigo-400/30 blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-xl shadow-indigo-300/50">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-neutral-900 mb-2">Analisando texto</h2>
        <p className="text-sm text-neutral-500 font-medium mb-8 min-h-[20px]">{etapaAtual}</p>

        <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-[width] duration-150 ease-linear"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <p className="text-xs text-neutral-400 font-bold mt-3 uppercase tracking-wider">
          {Math.round(progresso)}%
        </p>
      </div>
    </div>
  );
}
