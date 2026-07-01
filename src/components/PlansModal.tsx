import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  X,
  Zap,
  Flame,
  ChevronRight,
  Shield,
  Check,
  Infinity as InfinityIcon,
  Target,
  Sparkles,
  Clock,
  Star,
} from "lucide-react";

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const perks = [
  { icon: InfinityIcon, label: "Correções ilimitadas — sem cota e sem créditos" },
  { icon: Target, label: "Nota detalhada nas 5 competências (padrão INEP)" },
  { icon: Sparkles, label: "Feedback acionável parágrafo por parágrafo" },
  { icon: Check, label: "Repertório sugerido e banco com 200+ temas" },
  { icon: Clock, label: "Acesso imediato — comece em menos de 60 segundos" },
];

export function PlansModal({ isOpen, onClose }: PlansModalProps) {
  const navigate = useNavigate();
  const handleUnlock = () => {
    onClose();
    navigate({ to: "/auth" });
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          role="dialog"
          aria-modal="true"
          aria-label="Planos e desbloqueio"
          className="fixed inset-0 z-50 bg-[#FDFDFF] overflow-y-auto"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-200/40 rounded-full blur-[140px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-200/30 rounded-full blur-[120px]" />
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10 inline-flex items-center gap-2 text-neutral-500 font-bold hover:text-indigo-600 transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="text-sm">Voltar para o site</span>
          </button>

          <div className="relative container mx-auto px-4 sm:px-6 py-20 sm:py-16 max-w-5xl min-h-screen flex items-center">
            <div className="w-full grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
              {/* LEFT — pitch */}
              <div className="text-center lg:text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-black uppercase tracking-[0.18em]">
                  <Zap className="w-3 h-3 fill-indigo-700" />
                  Oferta exclusiva do diagnóstico
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-neutral-950 tracking-tight leading-[1.02]">
                  Desbloqueie seu{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Potencial Máximo
                  </span>
                </h2>
                <p className="text-lg text-neutral-500 font-medium max-w-lg mx-auto lg:mx-0">
                  Acesso ilimitado à IA treinada pelos critérios INEP. Cancele quando quiser.
                </p>

                <ul className="space-y-3 pt-2 max-w-md mx-auto lg:mx-0 text-left">
                  {perks.map((p) => {
                    const Icon = p.icon;
                    return (
                      <li key={p.label} className="flex items-start gap-3">
                        <span className="mt-0.5 w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 grid place-items-center shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-sm font-bold text-neutral-700 leading-snug">
                          {p.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex items-center justify-center lg:justify-start gap-1 pt-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-xs font-bold text-neutral-500">
                    4,9 · +47 mil estudantes corrigidos
                  </span>
                </div>
              </div>

              {/* RIGHT — plan card */}
              <div className="w-full max-w-md mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="relative bg-neutral-950 text-white rounded-[32px] p-8 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.55)] ring-1 ring-neutral-800 overflow-hidden"
                >
                  <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/40 rounded-full blur-[100px] pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-600/30 rounded-full blur-[100px] pointer-events-none" />

                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-neutral-900 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg inline-flex items-center gap-1 whitespace-nowrap">
                    <Flame className="w-3 h-3 fill-neutral-900" /> Oferta válida só hoje
                  </div>

                  <div className="relative">
                    <h3 className="text-xl font-black tracking-tight">Plano Mensal</h3>
                    <p className="text-white/60 font-medium text-sm mb-6">
                      Tudo desbloqueado · Cancele quando quiser
                    </p>

                    <div className="mb-2">
                      <span className="text-sm font-bold text-white/40 line-through">R$ 49,90</span>
                      <span className="ml-2 inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                        -60%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-lg font-black text-white/60">R$</span>
                      <span className="text-6xl font-black text-white tracking-tight tabular-nums">
                        19,90
                      </span>
                      <span className="text-white/50 font-bold">/mês</span>
                    </div>

                    <ul className="space-y-2.5 mb-7">
                      {[
                        "Correções ilimitadas",
                        "5 competências detalhadas",
                        "Reescrita assistida por IA",
                        "Histórico de evolução",
                      ].map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-sm font-medium text-white/85"
                        >
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      size="lg"
                      onClick={handleUnlock}
                      className="w-full h-14 text-base bg-white text-neutral-900 hover:bg-neutral-100 rounded-2xl font-black shadow-xl group"
                    >
                      Desbloquear agora
                      <ChevronRight className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="flex items-center justify-center gap-4 mt-5 text-[11px] text-white/50 font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> Garantia 7 dias
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span className="inline-flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Acesso imediato
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
