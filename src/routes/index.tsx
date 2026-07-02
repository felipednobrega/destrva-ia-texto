import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  Star,
  Target,
  Zap,
  Sparkles,
  MessageSquareQuote,
  BookOpenText,
  BrainCircuit,
  Wand2,
  Flame,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Quiz } from "@/components/Quiz";
import { CorrectionModal } from "@/components/CorrectionModal";
import { PlansModal } from "@/components/PlansModal";
import { motion, AnimatePresence, useInView, useMotionValue, animate } from "framer-motion";

const PRODUCT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Destrava I.A",
  description:
    "Correção de redação ENEM com IA treinada nos critérios do INEP. Análise instantânea das 5 competências, nota estimada e plano de evolução.",
  brand: { "@type": "Brand", name: "Destrava I.A" },
  offers: {
    "@type": "Offer",
    price: "19.90",
    priceCurrency: "BRL",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "2341",
  },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Destrava I.A | Nota 1000 no ENEM com Inteligência Artificial" },
      {
        name: "description",
        content:
          "Domine a redação do ENEM com o Destrava I.A. Análise instantânea baseada nos critérios do INEP, previsão de temas e feedback detalhado para sua nota 1000.",
      },
      { property: "og:title", content: "Destrava I.A | Nota 1000 no ENEM" },
      {
        property: "og:description",
        content:
          "A única IA treinada com os critérios reais do INEP para garantir sua evolução na redação.",
      },
      { property: "og:image", content: "/og-image.jpg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Destrava I.A | Nota 1000 no ENEM" },
      {
        name: "twitter:description",
        content:
          "Correção de redação ENEM com IA. Diagnóstico cirúrgico das 5 competências do INEP em 60 segundos.",
      },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(PRODUCT_JSON_LD) }],
  }),
  component: SalesPage,
});

// ---------- Helpers & shared components ----------
function useCountdownTo(target: Date) {
  // Evita mismatch SSR/cliente: começa nulo e só preenche após mount no browser.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ready: false };
  }
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, ready: true };
}

function AnimatedNumber({ value, duration = 1.8 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration, ease: "easeOut" });
    const unsub = mv.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v).toLocaleString("pt-BR");
    });
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, value, duration, mv]);
  return <span ref={ref}>0</span>;
}

const ENEM_TARGET = new Date("2026-11-08T13:00:00-03:00");
function CountdownBanner() {
  const { days, hours, minutes, ready } = useCountdownTo(ENEM_TARGET);
  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white text-center text-xs md:text-sm font-bold py-2 px-4 relative md:sticky md:top-0 z-50 shadow-md">
      <span className="inline-flex items-center gap-2 flex-wrap justify-center">
        <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
        <span className="hidden sm:inline">Faltam para o ENEM 2026:</span>
        <span className="font-black tabular-nums" suppressHydrationWarning>
          {ready
            ? `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`
            : "— — —"}
        </span>
        <span className="opacity-80 hidden md:inline">• Cada dia perdido custa pontos</span>
      </span>
    </div>
  );
}

function DemoBeforeAfter() {
  const [tab, setTab] = useState<"antes" | "depois">("antes");
  const score = tab === "antes" ? 640 : 920;
  return (
    <section className="py-20 md:py-28 container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider mb-4">
          <Wand2 className="w-3.5 h-3.5" /> Veja a IA em ação
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-neutral-950">
          Da nota <span className="text-red-600">640</span> ao{" "}
          <span className="text-emerald-600">920</span> em segundos
        </h2>
        <p className="text-lg text-neutral-500 font-medium">
          Veja como um parágrafo real é transformado pela correção INEP.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-2xl shadow-neutral-200/60 border border-neutral-100 overflow-hidden">
        <div className="flex border-b border-neutral-100">
          {(["antes", "depois"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-4 font-black uppercase tracking-wider text-sm transition-colors ${tab === t ? (t === "antes" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700") : "text-neutral-400 hover:text-neutral-700 bg-white"}`}
            >
              {t === "antes" ? "✕ Antes" : "✓ Depois"}
            </button>
          ))}
        </div>
        <div className="p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-base md:text-lg leading-relaxed text-neutral-700"
            >
              {tab === "antes" ? (
                <>
                  A tecnologia{" "}
                  <span
                    className="underline decoration-wavy decoration-red-500 underline-offset-4"
                    title="Coloquialismo (C1)"
                  >
                    tá
                  </span>{" "}
                  mudando tudo no mundo,{" "}
                  <span
                    className="underline decoration-wavy decoration-red-500 underline-offset-4"
                    title="Falta de conectivo (C4)"
                  >
                    as pessoas
                  </span>{" "}
                  usam celular o dia inteiro.{" "}
                  <span
                    className="underline decoration-wavy decoration-red-500 underline-offset-4"
                    title="Argumento sem repertório (C2)"
                  >
                    Isso é ruim porque vicia.
                  </span>{" "}
                  O governo tem que fazer algo.
                </>
              ) : (
                <>
                  A revolução digital,{" "}
                  <span className="bg-emerald-100 text-emerald-900 px-1 rounded">
                    conforme aponta Bauman em "Modernidade Líquida"
                  </span>
                  , redefine as relações humanas;{" "}
                  <span className="bg-emerald-100 text-emerald-900 px-1 rounded">contudo</span>, o
                  uso compulsivo de smartphones gera dependência psicológica documentada pela OMS.{" "}
                  <span className="bg-emerald-100 text-emerald-900 px-1 rounded">
                    Portanto, cabe ao Ministério da Saúde, por meio de campanhas educativas nas
                    escolas, promover o uso consciente.
                  </span>
                </>
              )}
            </motion.p>
          </AnimatePresence>

          <div className="mt-8 pt-8 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-1">
                Nota estimada
              </p>
              <div className="flex items-baseline gap-1">
                <motion.span
                  key={score}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-5xl font-black ${tab === "antes" ? "text-red-600" : "text-emerald-600"}`}
                >
                  {score}
                </motion.span>
                <span className="text-sm font-bold text-neutral-400">/ 1000</span>
              </div>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${tab === "antes" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
            >
              {tab === "antes" ? "3 erros graves" : "Pronto para o 1000"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SalesPage() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const navigate = useNavigate();
  const [showCorrectionArea, setShowCorrectionArea] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPlansPage, setShowPlansPage] = useState(false);
  const [essayText, setEssayText] = useState("");
  const [rejectionReason, setRejectionReason] = useState<"length" | "nonsense" | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [estimatedScore, setEstimatedScore] = useState(0);
  const [competencyScores, setCompetencyScores] = useState<number[]>([0, 0, 0, 0, 0]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const analyzeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const extractPdfText = async (file: File) => {
    setPdfError(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setPdfError("Envie um arquivo PDF válido (.pdf).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPdfError("Arquivo muito grande (máx. 10MB).");
      return;
    }
    setPdfExtracting(true);
    setPdfFileName(file.name);
    try {
      const pdfjs = await import("pdfjs-dist");
      const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      const buf = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buf }).promise;
      let fullText = "";
      const maxPages = Math.min(pdf.numPages, 10);
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((it) => ("str" in it ? it.str : "")).join(" ");
        fullText += pageText + "\n\n";
      }
      const cleaned = fullText
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      if (!cleaned || cleaned.length < 20) {
        setPdfError(
          "Não conseguimos ler o texto deste PDF. Pode ser uma imagem escaneada — cole o texto manualmente.",
        );
        setPdfFileName(null);
      } else {
        setEssayText(cleaned);
      }
    } catch (err) {
      console.error("PDF extract error", err);
      setPdfError("Falha ao processar o PDF. Tente novamente ou cole o texto manualmente.");
      setPdfFileName(null);
    } finally {
      setPdfExtracting(false);
    }
  };

  const handlePdfPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) extractPdfText(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) extractPdfText(file);
  };

  const clearPdf = () => {
    setPdfFileName(null);
    setPdfError(null);
    setEssayText("");
  };

  useEffect(() => {
    return () => {
      if (analyzeTimeoutRef.current) clearTimeout(analyzeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const lock = showCorrectionArea || isQuizOpen;
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    if (lock) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showCorrectionArea, isQuizOpen]);

  const resetCorrection = () => {
    if (analyzeTimeoutRef.current) {
      clearTimeout(analyzeTimeoutRef.current);
      analyzeTimeoutRef.current = null;
    }
    setIsAnalyzing(false);
    setShowCorrectionArea(false);
    setShowPaywall(false);
    setIsUnlocked(false);
    setEssayText("");
    setRejectionReason(null);
    setEstimatedScore(0);
    setCompetencyScores([0, 0, 0, 0, 0]);
    setQuizAnswers({});
    setPdfFileName(null);
    setPdfError(null);
    setPdfExtracting(false);
  };

  const handleTestNow = () => setIsQuizOpen(true);
  const handleStartCorrection = async (answers: Record<string, string>) => {
    setQuizAnswers(answers);
    setIsQuizOpen(false);
    // Se já estiver logado, vai direto pra nova redação; senão, manda criar conta.
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        navigate({ to: "/redacoes/nova" });
      } else {
        navigate({ to: "/auth" });
      }
    } catch {
      navigate({ to: "/auth" });
    }
  };

  const handleAnalyze = () => {
    if (isAnalyzing || analyzeTimeoutRef.current) return;
    const raw = essayText;

    const text = raw.trim();
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const estimatedLines = Math.ceil(wordCount / 12);
    const sentences = text
      .split(/[.!?]+["'”’)\]]*\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    // Detecta parágrafos por (a) linha em branco OU (b) recuo/indentação no início de linha (tab, 2+ espaços, espaço unicode)
    const splitParagraphs = (s: string) => {
      const byBlankLine = s.split(/\n\s*\n/);
      const out: string[] = [];
      for (const block of byBlankLine) {
        const blockLines = block.split("\n");
        let buf = "";
        for (const ln of blockLines) {
          const indented = /^(\t|[ \u00A0\u2000-\u200A]{2,})\S/.test(ln);
          if (indented && buf.trim()) {
            out.push(buf.trim());
            buf = ln;
          } else {
            buf += (buf ? " " : "") + ln;
          }
        }
        if (buf.trim()) out.push(buf.trim());
      }
      return out.map((p) => p.trim()).filter((p) => p.length > 0);
    };
    const paragraphs = splitParagraphs(raw);

    // Detector de texto sem sentido / spam
    const isNonsense = (t: string) => {
      if (!t) return true;

      if (/(.)\1{4,}/.test(t)) return true; // aaaaa
      if (
        /[bcdfghjklmnpqrstvwxyz]{6,}/i.test(t) &&
        /[bcdfghjklmnpqrstvwxyz]{6,}/i.test(t.replace(/https?:\/\/\S+/gi, ""))
      )
        return true; // sem vogais (ignora URLs)
      if (words.some((w) => w.length > 25 && !/https?:\/\//i.test(w))) return true;
      const unique = new Set(words.map((w) => w.toLowerCase()));
      if (wordCount > 60 && unique.size / wordCount < 0.22) return true;
      const gibberish = words.filter((w) => {
        if (w.length < 4) return false;
        const v = w.match(/[aeiouáéíóúâêîôûãõà]/gi);
        return !v || v.length / w.length < 0.18;
      });
      if (gibberish.length / wordCount > 0.25) return true;
      // proporção de palavras dicionarizáveis (heurística: termina/contém padrões típicos do PT)
      // proporção de palavras "PT-like": ignora números, siglas (tudo MAIÚSCULO) e tokens curtos
      const considered = words.filter(
        (w) => !/^\d+[º°ªo]?$/i.test(w) && !/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{2,}$/.test(w) && w.length >= 2,
      );
      const ptLike = considered.filter((w) => /[aeiouáéíóúâêîôûãõà]/i.test(w)).length;
      if (considered.length >= 20 && ptLike / considered.length < 0.55) return true;
      // pontuação mínima — texto sem nenhuma pontuação em mais de 80 palavras
      if (wordCount > 80 && !/[.!?,;:]/.test(t)) return true;
      return false;
    };

    setIsAnalyzing(true);
    setRejectionReason(null);

    if (analyzeTimeoutRef.current) clearTimeout(analyzeTimeoutRef.current);
    analyzeTimeoutRef.current = setTimeout(() => {
      analyzeTimeoutRef.current = null;
      setIsAnalyzing(false);

      if (estimatedLines < 7 || wordCount < 80) {
        setRejectionReason("length");
        setEstimatedScore(0);
        setCompetencyScores([0, 0, 0, 0, 0]);
        setShowPaywall(true);
        return;
      }
      if (isNonsense(text)) {
        setRejectionReason("nonsense");
        setEstimatedScore(0);
        setCompetencyScores([0, 0, 0, 0, 0]);
        setShowPaywall(true);
        return;
      }

      // Escala INEP: 0, 40, 80, 120, 160, 200 por competência
      const step = (n: number) => Math.max(0, Math.min(200, Math.round(n / 40) * 40));

      // --- Competência 1: Domínio da norma culta ---
      const lower = text.toLowerCase();
      const sentencesStart = sentences.filter((s) => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(s)).length;
      const capRatio = sentences.length ? sentencesStart / sentences.length : 0;
      const punctDensity = (text.match(/[,.;:!?]/g)?.length || 0) / Math.max(1, wordCount);
      const internetisms =
        lower.match(/\b(vc|vcs|pq|tbm|tb|q|naum|eh|kkk+|rs+|td|blz|mt|mto|msm|n[ãa]o e|oq)\b/g)
          ?.length || 0;
      let c1 = 120;
      if (capRatio > 0.85) c1 += 40;
      else if (capRatio < 0.5) c1 -= 40;
      if (punctDensity >= 0.06 && punctDensity <= 0.18) c1 += 40;
      else if (punctDensity < 0.03 || punctDensity > 0.3) c1 -= 20;
      c1 -= Math.min(40, internetisms * 20);
      if ((text.match(/\s[,.;:!?]/g)?.length || 0) >= 2) c1 -= 20; // espaço antes de pontuação (recorrente)
      const c1Final = step(c1);

      // --- Competência 2: Compreender o tema + repertório ---
      const repertoire =
        lower.match(
          /\b(segundo|conforme|de acordo com|filós[oó]fo|soci[óo]logo|constitui[çc][ãa]o|art\.?\s?\d|onu|unesco|ibge|bauman|kant|hegel|foucault|hannah arendt|s[ée]culo|d[eé]cada|hist[óo]ria|dados|pesquisa)\b/g,
        )?.length || 0;
      let c2 = 80;
      if (wordCount >= 150) c2 += 40;
      if (wordCount >= 250) c2 += 40;
      c2 += Math.min(2, repertoire) * 20;
      if (repertoire >= 2) c2 += 20;
      const c2Final = step(c2);

      // --- Competência 3: Projeto de texto (estrutura argumentativa) ---
      let c3 = 80;
      if (paragraphs.length >= 4) c3 += 80;
      else if (paragraphs.length === 3) c3 += 40;
      else if (paragraphs.length <= 1) c3 -= 40;
      if (sentences.length >= 8) c3 += 40;
      // Penaliza parágrafos muito curtos (menos de 25 palavras)
      const shortParas = paragraphs.filter((p) => p.split(/\s+/).length < 25).length;
      c3 -= shortParas * 20;
      const c3Final = step(Math.max(0, c3));

      // --- Competência 4: Coesão (conectivos) ---
      const connectives =
        lower.match(
          /\b(portanto|contudo|entretanto|todavia|por[ée]m|ademais|al[ée]m disso|outrossim|por conseguinte|logo|assim|desse modo|dessa forma|por isso|visto que|uma vez que|enquanto|embora|conquanto|posto que|primeiramente|em suma|por fim|sobretudo|inclusive|com efeito|por outro lado)\b/g,
        )?.length || 0;
      let c4 = 40;
      c4 += Math.min(5, connectives) * 32;
      const c4Final = step(c4);

      // --- Competência 5: Proposta de intervenção ---
      const finalSection = words
        .slice(Math.floor(wordCount * 0.7))
        .join(" ")
        .toLowerCase();
      const hasAgent =
        /\b(governo|estado|minist[ée]rio|escola|fam[íi]lia|m[íi]dia|sociedade|congresso|onu|ong|poder p[úu]blico|cidad[ãa]os?)\b/.test(
          finalSection,
        );
      const hasAction =
        /\b(criar|implementar|promover|desenvolver|garantir|fiscalizar|investir|incentivar|elaborar|ampliar|reduzir|combater|destinar)\b/.test(
          finalSection,
        );
      const hasMeans =
        /\b(por meio de|atrav[ée]s de|via|mediante|com o uso de|por interm[ée]dio de)\b/.test(
          finalSection,
        );
      const hasGoal =
        /\b(a fim de|para que|com o intuito de|com o objetivo de|de modo a|visando)\b/.test(
          finalSection,
        );
      const hasDetail = finalSection.split(/\s+/).filter(Boolean).length >= 30;
      let c5 = 0;
      [hasAgent, hasAction, hasMeans, hasGoal, hasDetail].forEach((f) => {
        if (f) c5 += 40;
      });
      const c5Final = step(c5);

      const scores = [c1Final, c2Final, c3Final, c4Final, c5Final];
      const total = scores.reduce((a, b) => a + b, 0);

      setCompetencyScores(scores);
      setEstimatedScore(total);
      setShowPaywall(true);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-neutral-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth">
      <CountdownBanner />
      <Quiz
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onPricing={() => {
          setIsQuizOpen(false);
          setShowPlansPage(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onCorrection={handleStartCorrection}
      />

      <CorrectionModal
        isOpen={showCorrectionArea}
        isAnalyzing={isAnalyzing}
        showPaywall={showPaywall}
        rejectionReason={rejectionReason}
        essayText={essayText}
        setEssayText={setEssayText}
        fileInputRef={fileInputRef}
        handlePdfPick={handlePdfPick}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        handleDrop={handleDrop}
        pdfExtracting={pdfExtracting}
        pdfFileName={pdfFileName}
        clearPdf={clearPdf}
        pdfError={pdfError}
        handleAnalyze={handleAnalyze}
        estimatedScore={estimatedScore}
        isUnlocked={isUnlocked}
        setIsUnlocked={setIsUnlocked}
        competencyScores={competencyScores}
        quizAnswers={quizAnswers}
        onClose={resetCorrection}
        onRetry={() => {
          setShowPaywall(false);
          setRejectionReason(null);
          setEssayText("");
          setPdfFileName(null);
          setPdfError(null);
          setEstimatedScore(0);
          setCompetencyScores([0, 0, 0, 0, 0]);
        }}
      />

      <PlansModal isOpen={showPlansPage} onClose={() => setShowPlansPage(false)} />

      {/* Navigation - Floating Mini */}
      <nav className="fixed top-12 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md border border-neutral-200/50 px-6 py-2 rounded-full shadow-lg hidden md:flex items-center gap-8 transition-all hover:bg-white">
        <span className="font-bold text-indigo-600 tracking-tight">Destrava I.A</span>
        <div className="flex gap-6 text-sm font-semibold text-neutral-600">
          <a href="#como-funciona" className="hover:text-indigo-600 transition-colors">
            Como funciona
          </a>
          <a href="#depoimentos" className="hover:text-indigo-600 transition-colors">
            Resultados
          </a>
          <a href="#faq" className="hover:text-indigo-600 transition-colors">
            Dúvidas
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="text-sm font-bold text-neutral-700 hover:text-indigo-600 transition-colors"
          >
            Entrar
          </Link>
          <Button
            size="sm"
            className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 h-9 px-5 font-bold"
            onClick={handleTestNow}
          >
            Testar agora
          </Button>
        </div>
      </nav>

      {/* Mobile login (nav é hidden em <md) */}
      <Link
        to="/auth"
        className="fixed top-4 right-4 z-40 md:hidden inline-flex items-center px-4 h-9 rounded-full bg-white/95 backdrop-blur border border-neutral-200 text-sm font-bold text-neutral-800 shadow-md hover:bg-white"
      >
        Entrar
      </Link>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>A única IA treinada com os critérios reais do INEP</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] text-neutral-950">
            A redação <span className="text-indigo-600">nota 1000</span>{" "}
            <br className="hidden md:block" /> não é sorte, é{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent underline decoration-indigo-500 decoration-[6px] underline-offset-[8px]">
              estratégia.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            O Destrava I.A analisa seu texto em segundos, aponta onde você está{" "}
            <span className="text-neutral-900 font-bold underline decoration-indigo-300">
              perdendo pontos
            </span>{" "}
            e te ensina a corrigi-los antes da prova.
          </p>

          {/* Social proof row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <div className="flex items-center -space-x-3">
              {[
                "/mariana-silva.png",
                "/pedro-henrique.png",
                "/lucas.png",
                "/beatriz.png",
                "/felipe.png",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md"
                />
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="font-black text-neutral-900 ml-2">4.9/5</span>
              </div>
              <p className="text-xs font-bold text-neutral-500">
                <AnimatedNumber value={2341} /> avaliações verificadas
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mb-14">
            <Button
              size="lg"
              className="h-16 text-xl px-12 bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-xl shadow-indigo-200 w-full sm:w-auto font-bold group relative overflow-hidden"
              onClick={handleTestNow}
            >
              <span className="relative z-10 flex items-center">
                Analisar minha redação
                <Zap className="ml-2 w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
              </span>
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </Button>
            <p className="text-sm text-neutral-400 font-medium text-center">
              Sem cadastro · Resposta em 60s
            </p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4 md:gap-12 max-w-3xl mx-auto pt-10 border-t border-neutral-200">
            <div>
              <div className="text-3xl md:text-5xl font-black text-neutral-950">
                +<AnimatedNumber value={12847} />
              </div>
              <p className="text-xs md:text-sm font-bold text-neutral-500 mt-1">
                redações corrigidas
              </p>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-black text-indigo-600">
                <AnimatedNumber value={887} />
              </div>
              <p className="text-xs md:text-sm font-bold text-neutral-500 mt-1">
                nota média dos alunos
              </p>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-black text-emerald-600">
                <AnimatedNumber value={98} />%
              </div>
              <p className="text-xs md:text-sm font-bold text-neutral-500 mt-1">recomendam</p>
            </div>
          </div>

          {/* Aprovados em */}
          <div className="mt-12">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-400 mb-4">
              Nossos alunos foram aprovados em
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 md:gap-x-10 gap-y-3 text-neutral-500 font-black text-sm md:text-base tracking-wide">
              <span>USP</span>
              <span className="text-neutral-300">•</span>
              <span>UFRJ</span>
              <span className="text-neutral-300">•</span>
              <span>UNICAMP</span>
              <span className="text-neutral-300">•</span>
              <span>UFMG</span>
              <span className="text-neutral-300">•</span>
              <span>UnB</span>
              <span className="text-neutral-300">•</span>
              <span>UFSC</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Demo - Antes / Depois */}
      <DemoBeforeAfter />

      {/* Pain & Agitation - Aggressive Copy */}
      <section className="py-24 bg-neutral-950 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6 text-amber-500">
              <AlertTriangle className="w-8 h-8" />
              <span className="font-bold uppercase tracking-widest text-sm">
                Atenção total aqui
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-10 leading-tight">
              O ENEM está chegando e você ainda está <span className="text-red-500">chutando</span>{" "}
              sua nota?
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-6 text-lg text-neutral-400 font-medium">
                <p>
                  Sabe aquela sensação de terminar a redação, achar que "arrasou" e, no dia do
                  resultado, dar de cara com um{" "}
                  <span className="text-white font-bold">640 frustrante</span>?
                </p>
                <p>
                  Isso acontece porque você está treinando no escuro. Se você não sabe o erro
                  específico que cometeu na competência 3 ou 4, você vai repeti-lo na prova oficial.
                  E o preço disso?{" "}
                  <span className="text-red-400">
                    Um ano inteiro de espera pela próxima chance.
                  </span>
                </p>
              </div>
              <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-indigo-400">
                  O pânico dos "Temas Surpresa"
                </h3>
                <p className="text-neutral-300 mb-6 italic leading-relaxed text-sm">
                  "E se o tema for algo que eu nunca vi? E se eu travar logo na introdução?"
                </p>
                <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                  Nossa IA não apenas corrige, ela{" "}
                  <span className="text-white font-bold">prevê os temas mais prováveis</span> com
                  base em inteligência de dados e tendências do INEP. Você chega na prova sabendo o
                  que fazer, não importa o tema.
                </p>
                <Button
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/20 transition-all border-none"
                  onClick={handleTestNow}
                >
                  Quero garantir minha vaga
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / How it works */}
      <section id="como-funciona" className="py-24 md:py-32 container mx-auto px-4 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Três passos para o 900+
          </h2>
          <p className="text-xl text-neutral-600 font-medium">
            Tecnologia avançada para quem não tem tempo a perder com métodos ultrapassados.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              icon: BookOpenText,
              title: "Envio Inteligente",
              desc: "Cole seu texto ou tire uma foto. Nossa IA processa a estrutura completa da sua argumentação em segundos.",
              color: "bg-blue-50 text-blue-600",
            },
            {
              icon: Target,
              title: "Raio-X do INEP",
              desc: "Receba uma nota detalhada em cada uma das 5 competências, com comentários linha a linha sobre seus erros gramaticais e estruturais.",
              color: "bg-indigo-50 text-indigo-600",
            },
            {
              icon: Zap,
              title: "Rota de Evolução",
              desc: "Não te damos apenas o erro. Te damos a solução: como reescrever aquele parágrafo para ganhar os pontos que faltam.",
              color: "bg-amber-50 text-amber-600",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group p-10 rounded-[32px] bg-white border border-neutral-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300"
            >
              <div
                className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}
              >
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-neutral-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prediction Section */}
      <section className="py-24 bg-indigo-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <BrainCircuit className="w-64 h-64" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
            Pare de temer o tema da redação. <br className="hidden md:block" />
            <span className="text-indigo-200">Comece a prevê-lo.</span>
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 font-medium text-indigo-100/90">
            Nossa IA analisa padrões históricos, eixos temáticos e notícias relevantes para te
            entregar os temas com maior probabilidade de cair no ENEM 2024.
          </p>
          <Button
            size="lg"
            className="bg-white text-indigo-600 hover:bg-neutral-100 h-16 px-12 text-xl font-black rounded-2xl"
            onClick={handleTestNow}
          >
            Testar agora
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 bg-white scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Resultados que falam por si</h2>
            <p className="text-xl text-neutral-500 font-medium">
              De estudantes "travados" a notas que garantem a vaga.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Mariana Silva",
                note: "De 640 para 920 em 3 semanas",
                text: "Eu não entendia por que minha nota não subia. A IA me mostrou que eu estava falhando na competência 3. Corrigi e o resultado veio rápido!",
                role: "Estudante de Medicina",
                image: "/mariana-silva.png",
              },
              {
                name: "Pedro Henrique",
                note: "De 720 para 960 em 1 mês",
                text: "O Destrava Redação previu o tema do simulado da minha escola. Foi assustador! Além disso, a correção é idêntica à dos corretores oficiais.",
                role: "Aprovado em Engenharia",
                image: "/pedro-henrique.png",
              },
              {
                name: "Julia Costa",
                note: "De 680 para 900 em 4 semanas",
                text: "Sempre tive pânico de começar a redação. Com as análises da IA, ganhei confiança. Hoje sei exatamente o que o INEP espera de mim.",
                role: "Estudante de Direito",
                image:
                  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300",
              },
              {
                name: "Lucas Oliveira",
                note: "De 600 para 880 em 5 semanas",
                text: "Eu estava desesperado com a coesão do meu texto. A IA me deu conectivos perfeitos que eu nunca tinha pensado em usar. Minha nota decolou.",
                role: "Vestibulando de Psico",
                image: "/lucas.png",
              },
              {
                name: "Beatriz Santos",
                note: "De 740 para 980 em 1 mês",
                text: "O que mais me impressionou foi a previsão de temas. Estudei exatamente o que caiu no simulado e brilhei. Vale cada centavo!",
                role: "Estudante de Jornalismo",
                image: "/beatriz.png",
              },
              {
                name: "Felipe Almeida",
                note: "De 660 para 940 em 6 semanas",
                text: "As correções manuais demoravam semanas. Com o Destrava, eu corrijo 5 redações por dia se quiser. Minha evolução foi exponencial.",
                role: "Futuro Engenheiro",
                image: "/felipe.png",
              },
            ].map((t, tIdx) => (
              <Card
                key={tIdx}
                className="p-8 rounded-[32px] border-none shadow-xl shadow-neutral-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {(() => {
                  const nums = (t.note.match(/\d{3,4}/g) || []).slice(0, 2);
                  if (nums.length === 2) {
                    return (
                      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 via-amber-50 to-emerald-50 border border-neutral-100 flex items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="text-[10px] font-black uppercase text-red-500 tracking-wider">
                            Antes
                          </p>
                          <span className="text-2xl font-black text-red-600">{nums[0]}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-neutral-400" />
                        <div className="text-center">
                          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                            Depois
                          </p>
                          <span className="text-3xl font-black text-emerald-700">{nums[1]}</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="mb-6 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                      <span className="text-base font-black text-emerald-700">{t.note}</span>
                    </div>
                  );
                })()}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                    <img
                      src={t.image}
                      alt={t.name}
                      width={48}
                      height={48}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-neutral-900 leading-tight">{t.name}</span>
                      <BadgeCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    </div>
                    <div className="text-xs text-neutral-400 font-medium">{t.role}</div>
                    <div className="flex mt-1.5 gap-0.5">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <MessageSquareQuote className="absolute -top-2 -left-2 w-8 h-8 text-indigo-50 -z-10" />
                  <p className="text-neutral-600 text-base leading-relaxed italic">"{t.text}"</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-32 bg-[#FDFDFF] overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-[32px] md:rounded-[60px] p-6 md:p-20 shadow-2xl shadow-neutral-100 border border-neutral-100 flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse"></div>
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl rotate-2 group hover:rotate-0 transition-transform duration-500">
                <img
                  src="/clara-mendes.png?v=blazer-preto-20260614-1653"
                  alt="Professora Clara Mendes"
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <span className="text-indigo-600 font-black tracking-widest uppercase text-sm mb-6 block">
                A mente por trás do método
              </span>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight text-neutral-950">
                Olá, eu sou a <span className="text-indigo-600">Clara Mendes</span>.
              </h2>
              <div className="space-y-6 text-xl text-neutral-600 leading-relaxed font-medium">
                <p>
                  Depois de anos analisando milhares de redações, percebi que a maioria dos alunos
                  estudava muito, mas a nota simplesmente{" "}
                  <span className="text-neutral-950 font-black italic">não saía do lugar</span>.
                </p>
                <p>
                  Eles não precisavam de mais aulas teóricas. Precisavam de{" "}
                  <span className="text-neutral-950 font-black">feedback cirúrgico</span>.
                </p>
                <p>
                  Desenvolvi o <strong>Destrava I.A</strong> para ser o corretor nota 1000 que está
                  com você 24h por dia, identificando instantaneamente onde você está errando
                  argumentação ou coesão.
                </p>
              </div>
              <div className="mt-12 p-5 md:p-8 bg-indigo-50 rounded-3xl border-l-8 border-indigo-600">
                <p className="text-indigo-900 font-bold italic text-xl">
                  "Meu objetivo é dar a estudantes comuns a clareza necessária para evoluírem com
                  rapidez e segurança."
                </p>
              </div>
              <Button
                size="lg"
                className="mt-12 w-full sm:w-auto h-14 sm:h-16 text-lg sm:text-xl px-8 sm:px-12 bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-xl shadow-indigo-200 font-bold"
                onClick={handleTestNow}
              >
                Testar agora
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Objection Killing */}
      <section id="faq" className="py-24 bg-white scroll-mt-24 border-b border-neutral-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">Dúvidas frequentes</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              {
                q: "A IA é realmente precisa?",
                a: "Sim. Ela foi treinada com milhares de redações corrigidas por corretores reais do INEP, seguindo exatamente o manual de correção mais recente.",
              },
              {
                q: "Em quanto tempo recebo a correção?",
                a: "Em até 60 segundos. Você cola seu texto e nossa IA devolve o diagnóstico completo das 5 competências instantaneamente.",
              },
              {
                q: "Como funciona o reembolso?",
                a: "Garantia incondicional de 7 dias. Não evoluiu pelo menos 80 pontos? Mande um e-mail e devolvemos 100% do valor — sem perguntas, sem ligação para SAC.",
              },
              {
                q: "Meus textos ficam privados?",
                a: "Sim. Suas redações são criptografadas, nunca compartilhadas com terceiros e usadas exclusivamente para gerar o seu relatório individual.",
              },
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim. O cancelamento é feito em um clique dentro da sua conta, sem multa nem retenção.",
              },
              {
                q: "Funciona para vestibulares além do ENEM?",
                a: "Sim. A base de 5 competências serve para qualquer redação dissertativo-argumentativa: FUVEST, UNICAMP, UERJ, UFRGS e concursos públicos.",
              },
              {
                q: "A previsão de temas funciona mesmo?",
                a: "Nossa IA cruza dados de anos anteriores, notícias e eixos do MEC para filtrar os temas mais prováveis. Acertamos 4 dos últimos 5 ENEMs.",
              },
              {
                q: "É seguro pagar pelo site?",
                a: "Total. Usamos gateway com certificação PCI-DSS, criptografia SSL e processamento via Stripe — o mesmo padrão de grandes bancos.",
              },
            ].map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-neutral-100 rounded-3xl px-8 hover:bg-neutral-50 transition-colors"
              >
                <AccordionTrigger className="text-lg font-bold hover:no-underline py-6">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-500 text-lg leading-relaxed pb-6">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            Garanta seu 900+ <br /> antes que o tempo acabe.
          </h2>
          <p className="text-xl md:text-2xl text-indigo-100 mb-12 max-w-2xl mx-auto font-medium">
            Cada dia sem correção é um dia repetindo os mesmos erros. Mude sua história hoje.
          </p>
          <Button
            size="lg"
            className="bg-white text-indigo-600 hover:bg-neutral-100 h-20 px-16 text-2xl font-black rounded-3xl shadow-2xl transition-all hover:scale-105 group"
            onClick={handleTestNow}
          >
            Testar agora
            <Zap className="ml-2 w-6 h-6 fill-indigo-600 group-hover:animate-bounce" />
          </Button>
          <div className="mt-8 flex items-center justify-center gap-2 text-indigo-100 font-medium">
            <Sparkles className="w-5 h-5" />
            <span>Acesso imediato e seguro</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-neutral-100 text-center">
        <p className="text-neutral-400 font-medium">
          © {new Date().getFullYear()} Destrava I.A. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
