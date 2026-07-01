import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  X,
  ArrowRight,
  Trophy,
  ShieldAlert,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface QuizProps {
  isOpen: boolean;
  onClose: () => void;
  onPricing: () => void;
  onCorrection: (answers: Record<string, string>) => void;
}

const steps = [
  {
    id: 1,
    eyebrow: "Etapa 01 · Diagnóstico",
    question: "Você já encarou o campo de batalha do ENEM ou é sua primeira vez?",
    options: [
      { label: "Já sou veterano", value: "veteran" },
      { label: "Primeira viagem", value: "newbie" },
      { label: "Só estou treinando", value: "training" },
    ],
    icon: ShieldAlert,
  },
  {
    id: 2,
    eyebrow: "Etapa 02 · Histórico",
    question: "Qual foi o seu último 'troféu' de nota? Seja honesto, a IA não perdoa mentiras.",
    options: [
      { label: "Abaixo de 600 (Socorro!)", value: "low" },
      { label: "Entre 600 e 800 (Mediano)", value: "mid" },
      { label: "Acima de 800 (Falta pouco)", value: "high" },
      { label: "Nunca fiz um simulado", value: "none" },
    ],
    icon: Trophy,
  },
  {
    id: 3,
    eyebrow: "Etapa 03 · Dor",
    question: "Onde o seu sonho de nota 1000 está morrendo?",
    options: [
      { label: "Não sei começar (Trava total)", value: "start" },
      { label: "Repertório pobre", value: "repertory" },
      { label: "Erros de gramática bobos", value: "grammar" },
      { label: "Não conecto as ideias", value: "cohesion" },
    ],
    icon: Target,
  },
  {
    id: 4,
    eyebrow: "Etapa 04 · Urgência",
    question: "Quanto tempo você ainda vai desperdiçar com métodos que não funcionam?",
    options: [
      { label: "Não aguento mais perder tempo", value: "urgent" },
      { label: "Estou tentando o que dá", value: "trying" },
      { label: "Preciso de um milagre", value: "miracle" },
    ],
    icon: Clock,
  },
  {
    id: 5,
    eyebrow: "Etapa 05 · Decisão",
    question: "Você está pronto para parar de chutar e começar a dominar?",
    options: [
      { label: "SIM! Quero o 900+ agora", value: "yes" },
      { label: "Talvez, ainda tenho medo", value: "maybe" },
    ],
    icon: Zap,
  },
];

export function Quiz({ isOpen, onClose, onPricing, onCorrection }: QuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsFinished(false);
      setAnswers({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = (value: string) => {
    const stepId = steps[currentStep].id.toString();
    setAnswers((prev) => ({ ...prev, [stepId]: value }));

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const current = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Teste de nivelamento"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="relative w-full max-w-2xl my-auto bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_30px_120px_-20px_rgba(79,70,229,0.45)] ring-1 ring-neutral-200/60 overflow-hidden"
      >
        {/* Decorative gradient header band */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500" />

        <button
          onClick={onClose}
          aria-label="Fechar teste"
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-50 hover:bg-neutral-100 ring-1 ring-neutral-200 transition-all z-10 group"
        >
          <X
            className="w-4 h-4 text-neutral-500 group-hover:text-neutral-900 transition-colors"
            aria-hidden="true"
          />
        </button>

        <div className="p-6 sm:p-10 md:p-12 pt-10">
          <AnimatePresence mode="wait">
            {!isFinished ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="space-y-7"
              >
                {/* Progress header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl grid place-items-center text-white shadow-lg shadow-indigo-200">
                        <current.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-indigo-600 truncate">
                        {current.eyebrow}
                      </span>
                    </div>
                    <span className="text-xs font-black text-neutral-400 tabular-nums shrink-0">
                      {String(currentStep + 1).padStart(2, "0")}
                      <span className="text-neutral-300">
                        /{String(steps.length).padStart(2, "0")}
                      </span>
                    </span>
                  </div>

                  <div className="relative h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    />
                  </div>
                </div>

                <h2 className="text-[26px] sm:text-3xl md:text-[34px] font-black text-neutral-900 leading-[1.1] tracking-tight">
                  {current.question}
                </h2>

                <div className="grid gap-2.5">
                  {current.options.map((option, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleNext(option.value)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ x: 4 }}
                      className="group flex items-center justify-between gap-3 p-5 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:border-indigo-600 hover:shadow-[0_8px_30px_-8px_rgba(79,70,229,0.35)] transition-all text-left"
                    >
                      <span className="font-bold text-neutral-800 group-hover:text-indigo-900 text-[15px] sm:text-base">
                        {option.label}
                      </span>
                      <span className="w-8 h-8 shrink-0 rounded-full bg-white ring-1 ring-neutral-200 group-hover:bg-indigo-600 group-hover:ring-indigo-600 grid place-items-center transition-all">
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 24 }}
                className="text-center space-y-6 py-2"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
                  className="relative w-20 h-20 mx-auto"
                >
                  <div className="absolute inset-0 bg-emerald-200 rounded-full blur-2xl opacity-60" />
                  <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full grid place-items-center text-white shadow-xl shadow-emerald-200">
                    <CheckCircle2 className="w-10 h-10" strokeWidth={2.5} />
                  </div>
                </motion.div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Diagnóstico completo
                  </div>
                  <h2 className="text-3xl md:text-[38px] font-black text-neutral-900 leading-[1.05] tracking-tight">
                    Sua evolução <br />
                    <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                      começa agora.
                    </span>
                  </h2>
                </div>

                <div className="text-[15px] text-neutral-600 font-medium max-w-md mx-auto space-y-3 text-left bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
                  {answers["3"] === "start" && (
                    <p>
                      Seu maior obstáculo é o{" "}
                      <strong className="text-neutral-900">bloqueio criativo inicial</strong>. Vamos
                      te dar o mapa para nunca mais travar na introdução.
                    </p>
                  )}
                  {answers["3"] === "repertory" && (
                    <p>
                      Seu diagnóstico aponta{" "}
                      <strong className="text-neutral-900">falta de repertório</strong>. Vamos
                      conectar sua redação com filósofos e sociólogos que garantem o 900+.
                    </p>
                  )}
                  {answers["3"] === "grammar" && (
                    <p>
                      Seus <strong className="text-neutral-900">erros gramaticais</strong> estão
                      drenando sua nota. Nossa IA vai blindar sua norma culta em tempo recorde.
                    </p>
                  )}
                  {answers["3"] === "cohesion" && (
                    <p>
                      A <strong className="text-neutral-900">falta de coesão</strong> é o que está
                      te segurando. Vamos te ensinar os conectivos que os corretores amam ver.
                    </p>
                  )}

                  {answers["1"] === "veteran" ? (
                    <p className="text-sm text-indigo-700 bg-white p-3 rounded-xl border border-indigo-100">
                      Como você já é veterano, focaremos nos <strong>detalhes técnicos</strong> que
                      faltam para o seu 1000.
                    </p>
                  ) : (
                    <p className="text-sm text-emerald-700 bg-white p-3 rounded-xl border border-emerald-100">
                      Para sua primeira vez, vamos construir uma <strong>base indestrutível</strong>{" "}
                      para você começar no topo.
                    </p>
                  )}
                </div>

                <div className="grid gap-3 pt-2">
                  <Button
                    size="lg"
                    className="h-16 sm:h-[68px] text-base sm:text-lg bg-neutral-900 hover:bg-neutral-800 rounded-2xl font-black shadow-xl shadow-neutral-900/20 group"
                    onClick={() => onCorrection(answers)}
                  >
                    Quero fazer um teste agora
                    <ArrowRight className="ml-1.5 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <button
                    onClick={onPricing}
                    className="h-12 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    Pular teste e ver planos →
                  </button>
                </div>

                <p className="text-xs text-neutral-400 font-medium pt-1">
                  Acesso imediato à plataforma de correção.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
