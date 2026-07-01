import { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  X,
  Sparkles,
  Wand2,
  Upload,
  ScrollText,
  CheckCircle2,
  Loader2,
  Trash2,
  FileUp,
  AlertCircle,
  Clock,
  Award,
  Eye,
  ChevronRight,
  TrendingUp,
  PenLine,
  BookOpen,
  FileText,
  Link2,
  Lightbulb,
} from "lucide-react";

interface CorrectionModalProps {
  isOpen: boolean;
  isAnalyzing: boolean;
  showPaywall: boolean;
  rejectionReason: "length" | "nonsense" | null;
  essayText: string;
  setEssayText: (v: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handlePdfPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  handleDrop: (e: React.DragEvent) => void;
  pdfExtracting: boolean;
  pdfFileName: string | null;
  clearPdf: () => void;
  pdfError: string | null;
  handleAnalyze: () => void;
  estimatedScore: number;
  isUnlocked: boolean;
  setIsUnlocked: (v: boolean) => void;
  competencyScores: number[];
  quizAnswers: Record<string, string>;
  onClose: () => void;
  onRetry?: () => void;
}

export function CorrectionModal({
  isOpen,
  isAnalyzing,
  showPaywall,
  rejectionReason,
  essayText,
  setEssayText,
  fileInputRef,
  handlePdfPick,
  isDragging,
  setIsDragging,
  handleDrop,
  pdfExtracting,
  pdfFileName,
  clearPdf,
  pdfError,
  handleAnalyze,
  estimatedScore,
  isUnlocked,
  setIsUnlocked,
  competencyScores,
  quizAnswers,
  onClose,
  onRetry,
}: CorrectionModalProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          role="dialog"
          aria-modal="true"
          aria-label={
            showPaywall
              ? rejectionReason
                ? "Resultado: redação desclassificada"
                : "Resultado da análise da redação"
              : "Enviar redação para correção"
          }
          className="fixed inset-0 z-50 bg-white overflow-y-auto pb-20"
        >
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <button
              onClick={onClose}
              className="mb-8 flex items-center gap-2 text-neutral-500 font-bold hover:text-indigo-600 transition-colors"
            >
              <X className="w-5 h-5" />
              Voltar para o site
            </button>

            <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50/40 rounded-[40px] p-8 md:p-14 border border-indigo-100 shadow-[0_30px_80px_-40px_rgba(79,70,229,0.35)]">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div
                    className={`absolute inset-0 rounded-3xl blur-2xl ${
                      rejectionReason ? "bg-red-400/30" : "bg-indigo-400/30"
                    } ${isAnalyzing ? "animate-pulse" : ""}`}
                  />
                  <div
                    className={`relative w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-xl ${
                      rejectionReason
                        ? "bg-gradient-to-br from-red-500 to-red-700 shadow-red-300/50"
                        : "bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-300/50"
                    }`}
                  >
                    {isAnalyzing ? (
                      <Wand2 className="w-10 h-10 animate-pulse" />
                    ) : rejectionReason ? (
                      <AlertCircle className="w-10 h-10" />
                    ) : (
                      <Upload className="w-10 h-10" />
                    )}
                  </div>
                </div>
              </div>

              {!showPaywall ? (
                <>
                  <div className="text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-4">
                      <Sparkles className="w-3.5 h-3.5" /> Correção INEP em até 60s
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-4 text-neutral-900 leading-tight tracking-tight">
                      Envie sua redação agora
                    </h2>
                    <p className="text-lg md:text-xl text-neutral-600 font-medium mb-10">
                      Cole seu rascunho abaixo. Nossa IA analisa cada uma das{" "}
                      <span className="text-indigo-600 font-bold">5 competências do INEP</span> e
                      devolve um diagnóstico cirúrgico.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAnalyze();
                    }}
                    className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-neutral-100 max-w-2xl mx-auto"
                  >
                    {(() => {
                      const words = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
                      const lines = essayText.trim()
                        ? essayText
                            .trim()
                            .split(/\n+/)
                            .filter((l) => l.trim()).length
                        : 0;
                      const minOk = words >= 80;
                      return (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                              <ScrollText className="w-4 h-4 text-indigo-600" />
                              Texto da redação
                            </label>
                            <div className="flex items-center gap-3 text-xs font-bold">
                              <span
                                className={`flex items-center gap-1 ${minOk ? "text-emerald-600" : "text-neutral-400"}`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> {words} palavras
                              </span>
                              <span className="text-neutral-300">•</span>
                              <span className="text-neutral-500">{lines} linhas</span>
                            </div>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handlePdfPick}
                            className="hidden"
                          />
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={`relative mb-4 rounded-2xl border-2 border-dashed transition-all ${
                              isDragging
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-neutral-200 bg-neutral-50/60 hover:border-indigo-300 hover:bg-indigo-50/40"
                            }`}
                          >
                            {pdfExtracting ? (
                              <div className="flex items-center justify-center gap-3 p-5 text-indigo-700 font-bold text-sm">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Extraindo texto do PDF...
                              </div>
                            ) : pdfFileName ? (
                              <div className="flex items-center justify-between gap-3 p-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-neutral-900 truncate">
                                      {pdfFileName}
                                    </p>
                                    <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">
                                      Texto importado com sucesso
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={clearPdf}
                                  disabled={isAnalyzing}
                                  aria-label="Remover PDF"
                                  className="shrink-0 w-9 h-9 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isAnalyzing}
                                className="w-full flex items-center justify-center gap-3 p-5 text-sm font-bold text-neutral-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
                              >
                                <FileUp className="w-5 h-5" />
                                <span>
                                  <span className="text-indigo-700 underline decoration-2 underline-offset-2">
                                    Enviar PDF
                                  </span>
                                  <span className="text-neutral-500 font-medium">
                                    {" "}
                                    ou arraste aqui
                                  </span>
                                </span>
                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider hidden sm:inline">
                                  · máx. 10MB
                                </span>
                              </button>
                            )}
                          </div>
                          {pdfError && (
                            <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                              <p className="text-xs text-red-700 font-bold text-left">{pdfError}</p>
                            </div>
                          )}

                          <textarea
                            placeholder="Cole aqui o seu rascunho completo... (mínimo 80 palavras / 7 linhas conforme INEP)"
                            disabled={isAnalyzing || pdfExtracting}
                            value={essayText}
                            onChange={(e) => setEssayText(e.target.value)}
                            className="w-full h-64 p-6 rounded-2xl bg-neutral-50 border-2 border-neutral-100 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 text-base font-medium resize-none mb-3 disabled:opacity-50 transition-all outline-none leading-relaxed"
                          />
                          <div className="flex items-start gap-2 mb-5 px-1">
                            <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-neutral-500 font-medium text-left">
                              Textos com menos de 80 palavras ou fugindo ao tema são
                              desclassificados automaticamente (regra INEP).
                            </p>
                          </div>
                          <Button
                            size="lg"
                            type="submit"
                            disabled={isAnalyzing || !essayText.trim()}
                            className="w-full h-16 text-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-2xl font-black shadow-lg shadow-indigo-300/40 disabled:from-indigo-300 disabled:to-indigo-300 disabled:shadow-none transition-all"
                          >
                            {isAnalyzing ? (
                              <span className="flex items-center gap-2">
                                <Sparkles className="animate-spin w-6 h-6" />
                                Analisando 5 competências...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Wand2 className="w-6 h-6" />
                                Analisar minha redação
                              </span>
                            )}
                          </Button>
                          <div className="flex items-center justify-center gap-4 mt-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> 60s
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Award className="w-3 h-3" /> Critérios INEP
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> 100% privado
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-xl mx-auto text-center"
                >
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black mb-6 ${
                      rejectionReason
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {rejectionReason ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        REDAÇÃO DESCLASSIFICADA
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        ANÁLISE CONCLUÍDA COM SUCESSO!
                      </>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black mb-6 text-neutral-900 leading-tight">
                    {rejectionReason
                      ? "Sua redação foi desclassificada"
                      : "Sua correção está pronta e te esperando!"}
                  </h2>
                  <p className="text-lg text-neutral-600 font-medium mb-10">
                    {rejectionReason === "length" &&
                      "Identificamos que seu texto possui menos de 7 linhas ou 80 palavras, o que resulta em desclassificação automática conforme os critérios do INEP."}
                    {rejectionReason === "nonsense" &&
                      "Detectamos que o texto enviado não possui sentido semântico ou estrutura textual adequada, sendo desclassificado por falta de coesão e coerência."}
                    {!rejectionReason && (
                      <>
                        {quizAnswers["3"] === "start" &&
                          "Identificamos que o seu maior desafio é tirar as ideias do papel e começar a introdução de forma sólida. "}
                        {quizAnswers["3"] === "repertory" &&
                          "Seu texto carece de um repertório sociocultural mais produtivo e legitimado, o que trava sua nota na Competência 2. "}
                        {quizAnswers["3"] === "grammar" &&
                          "Detectamos desvios recorrentes de norma culta que estão drenando seus pontos na Competência 1. "}
                        {quizAnswers["3"] === "cohesion" &&
                          "Sua redação apresenta falhas na articulação entre os parágrafos, prejudicando a coesão textual. "}
                        {!["start", "repertory", "grammar", "cohesion"].includes(
                          quizAnswers["3"] ?? "",
                        ) &&
                          "Mapeamos os pontos críticos da sua redação em todas as 5 competências do INEP. "}
                        Identificamos <span className="text-red-600 font-bold">4 erros graves</span>{" "}
                        e <span className="text-red-600 font-bold">2 falhas</span> críticas que
                        estão impedindo você de chegar ao 900+.
                      </>
                    )}
                  </p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-[40px] p-10 shadow-2xl border border-indigo-100 relative overflow-hidden mb-8"
                  >
                    {/* Score Header */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="text-left">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider mb-2">
                            <Award className="w-3 h-3" /> Relatório INEP
                          </div>
                          <h3 className="text-2xl font-black text-neutral-900 leading-tight">
                            Diagnóstico Completo
                          </h3>
                          <p className="text-sm text-neutral-500 font-medium mt-1">
                            5 competências oficiais analisadas
                          </p>
                        </div>
                      </div>

                      {!rejectionReason &&
                        (() => {
                          const pct = Math.min(100, (estimatedScore / 1000) * 100);
                          const r = 52;
                          const c = 2 * Math.PI * r;
                          const dash = isUnlocked ? (pct / 100) * c : 0;
                          const verdictTone =
                            estimatedScore >= 800
                              ? "emerald"
                              : estimatedScore >= 600
                                ? "amber"
                                : "red";
                          const verdict =
                            estimatedScore >= 800
                              ? "Excelente — rumo ao 1000"
                              : estimatedScore >= 600
                                ? "Bom — com ajustes você sobe muito"
                                : "Crítico — precisa de correção urgente";
                          const verdictBg = {
                            emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
                            amber: "bg-amber-50 border-amber-200 text-amber-700",
                            red: "bg-red-50 border-red-200 text-red-700",
                          }[verdictTone];
                          const strokeColor =
                            verdictTone === "emerald"
                              ? "#10b981"
                              : verdictTone === "amber"
                                ? "#f59e0b"
                                : "#ef4444";
                          return (
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-neutral-50 to-white border border-neutral-100">
                              <div className="relative w-32 h-32 shrink-0">
                                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r={r}
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="10"
                                  />
                                  <motion.circle
                                    cx="60"
                                    cy="60"
                                    r={r}
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={c}
                                    initial={{ strokeDashoffset: c }}
                                    animate={{ strokeDashoffset: c - dash }}
                                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span
                                    className={`text-3xl font-black text-neutral-900 ${isUnlocked ? "" : "blur-sm select-none"}`}
                                  >
                                    {isUnlocked ? estimatedScore : "???"}
                                  </span>
                                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                    / 1000
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-1">
                                  Nota estimada
                                </p>
                                <div
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-black ${isUnlocked ? verdictBg : "bg-neutral-100 border-neutral-200 text-neutral-400"}`}
                                >
                                  <TrendingUp className="w-3.5 h-3.5" />
                                  {isUnlocked ? verdict : "Desbloqueie para ver"}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                  <div className="p-2 rounded-lg bg-white border border-neutral-100">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase">
                                      Acertos
                                    </p>
                                    <p
                                      className={`text-lg font-black text-emerald-600 ${isUnlocked ? "" : "blur-sm select-none"}`}
                                    >
                                      {isUnlocked
                                        ? competencyScores.filter((s) => s >= 160).length
                                        : "?"}
                                      /5
                                    </p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-white border border-neutral-100">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase">
                                      Falhas
                                    </p>
                                    <p
                                      className={`text-lg font-black text-red-600 ${isUnlocked ? "" : "blur-sm select-none"}`}
                                    >
                                      {isUnlocked
                                        ? competencyScores.filter((s) => s < 100).length
                                        : "?"}
                                      /5
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                    </div>

                    {/* Competencies */}
                    <div className="space-y-4 mb-8 text-left">
                      {rejectionReason ? (
                        <div className="flex items-center gap-3 p-5 bg-red-50 rounded-2xl border border-red-100">
                          <X className="w-6 h-6 text-red-600 shrink-0" />
                          <div>
                            <p className="font-bold text-red-900">
                              {rejectionReason === "length"
                                ? "Critério de Extensão (INEP)"
                                : "Fuga ao padrão / Texto insuficiente"}
                            </p>
                            <p className="text-sm text-red-700">
                              {rejectionReason === "length"
                                ? "Texto com menos de 7 linhas ou 80 palavras é desclassificado. Nota: 0"
                                : "Conteúdo sem coerência semântica, repetições ou caracteres aleatórios. Nota: 0"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {[
                            {
                              label: "C1 — Domínio da norma culta",
                              score: competencyScores[0],
                              icon: PenLine,
                              desc: "Gramática, ortografia e registro formal",
                            },
                            {
                              label: "C2 — Compreensão do tema e repertório",
                              score: competencyScores[1],
                              icon: BookOpen,
                              desc: "Argumentos e conhecimento sociocultural",
                            },
                            {
                              label: "C3 — Projeto de texto / argumentação",
                              score: competencyScores[2],
                              icon: FileText,
                              desc: "Estrutura, tese e desenvolvimento",
                            },
                            {
                              label: "C4 — Coesão textual",
                              score: competencyScores[3],
                              icon: Link2,
                              desc: "Conectivos e articulação entre parágrafos",
                            },
                            {
                              label: "C5 — Proposta de intervenção",
                              score: competencyScores[4],
                              icon: Lightbulb,
                              desc: "Solução viável e bem detalhada",
                            },
                          ].map((c, idx) => {
                            const pct = (c.score / 200) * 100;
                            const tone =
                              c.score >= 160 ? "emerald" : c.score >= 100 ? "amber" : "red";
                            const toneMap = {
                              emerald: {
                                bg: "bg-emerald-50",
                                border: "border-emerald-200",
                                text: "text-emerald-900",
                                sub: "text-emerald-600",
                                bar: "bg-emerald-500",
                                iconBg: "bg-emerald-100",
                                icon: "text-emerald-600",
                              },
                              amber: {
                                bg: "bg-amber-50",
                                border: "border-amber-200",
                                text: "text-amber-900",
                                sub: "text-amber-600",
                                bar: "bg-amber-500",
                                iconBg: "bg-amber-100",
                                icon: "text-amber-600",
                              },
                              red: {
                                bg: "bg-red-50",
                                border: "border-red-200",
                                text: "text-red-900",
                                sub: "text-red-600",
                                bar: "bg-red-500",
                                iconBg: "bg-red-100",
                                icon: "text-red-600",
                              },
                              neutral: {
                                bg: "bg-neutral-50",
                                border: "border-neutral-200",
                                text: "text-neutral-900",
                                sub: "text-neutral-500",
                                bar: "bg-neutral-300",
                                iconBg: "bg-neutral-100",
                                icon: "text-neutral-500",
                              },
                            };
                            const t = toneMap[isUnlocked ? tone : "neutral"];
                            const Icon = c.icon;
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.4 }}
                                className={`p-5 rounded-2xl border ${t.bg} ${t.border}`}
                              >
                                <div className="flex items-start gap-3 mb-3">
                                  <div
                                    className={`w-10 h-10 rounded-xl ${t.iconBg} flex items-center justify-center shrink-0`}
                                  >
                                    <Icon className={`w-5 h-5 ${t.icon}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className={`font-bold text-sm ${t.text}`}>{c.label}</p>
                                      <span
                                        className={`font-black text-lg shrink-0 ${isUnlocked ? t.text : "blur-sm select-none"}`}
                                      >
                                        {isUnlocked ? `${c.score}` : "???"}
                                        <span className="text-sm font-bold opacity-50">/200</span>
                                      </span>
                                    </div>
                                    <p className={`text-xs font-medium mt-0.5 ${t.sub}`}>
                                      {c.desc}
                                    </p>
                                  </div>
                                </div>
                                <div className="w-full bg-white/70 rounded-full h-2.5 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: isUnlocked ? `${pct}%` : "0%" }}
                                    transition={{
                                      delay: idx * 0.1 + 0.3,
                                      duration: 0.8,
                                      ease: "easeOut",
                                    }}
                                    className={`h-full rounded-full ${t.bar}`}
                                  />
                                </div>
                              </motion.div>
                            );
                          })}
                        </>
                      )}
                    </div>

                    {!isUnlocked && !rejectionReason ? (
                      <div className="space-y-4">
                        <Button
                          size="lg"
                          className="w-full h-16 text-xl bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black shadow-xl shadow-indigo-200 group"
                          onClick={() => setIsUnlocked(true)}
                        >
                          Desbloquear pontuação completa
                          <span className="ml-2 bg-white/20 px-2 py-1 rounded text-sm">
                            R$ 19,90
                          </span>
                        </Button>
                        <p className="text-neutral-400 text-sm font-medium">
                          🔒 Pagamento 100% seguro e acesso imediato.
                        </p>
                      </div>
                    ) : rejectionReason ? (
                      <div className="space-y-3">
                        <Button
                          size="lg"
                          className="w-full h-16 text-xl bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black shadow-xl shadow-indigo-200 group"
                          onClick={onRetry ?? onClose}
                        >
                          Tentar novamente
                          <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="w-full text-sm font-bold text-neutral-500 hover:text-neutral-800 transition-colors py-2"
                        >
                          Voltar para o site
                        </button>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        className="w-full h-16 text-xl bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black shadow-xl shadow-indigo-200 group"
                        onClick={onClose}
                      >
                        Continuar evoluindo
                        <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
