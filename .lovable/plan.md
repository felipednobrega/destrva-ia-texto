# Prompt de Melhorias — Destrava Redação AI

Abaixo está um **prompt único, detalhado e pronto para colar** no chat quando você quiser executar as melhorias. Nada será implementado agora — é só o plano.

---

## Diagnóstico rápido do estado atual

- **Arquivo monolítico**: `src/routes/index.tsx` concentra hero, dor, como funciona, previsão de temas, depoimentos, FAQ, planos, quiz e overlay de análise. Difícil manter.
- **Sem design tokens**: cores `indigo-*`, `neutral-*`, `white`, `black` hardcoded em centenas de classes. Impede dark mode, re-skin e quebra a regra do design system do projeto.
- **Prova social fraca acima da dobra**: hero é só copy. Sem números, estrelas, avatares ou logos.
- **Sem demo do produto antes do CTA**: usuário só vê IA depois de enviar texto.
- **Urgência ausente**: nada de countdown ENEM, preço cheio riscado, escassez real.
- **Depoimentos recém-ajustados** mas ainda sem print de espelho INEP, vídeo ou destaque "antes → depois" gigante.
- **FAQ enxuto**: faltam objeções clássicas (reembolso, privacidade, prazo, cancelamento).
- **CTAs repetidos**: mesmo texto em todas as seções, sem variação por contexto.
- **Mobile**: sem CTA fixo inferior; nav some no mobile.
- **SEO/share**: falta `og:image`, `twitter:card`, JSON-LD de Product + AggregateRating.
- **Performance**: `<img>` sem `loading="lazy"`, sem `width/height`, mistura Unsplash + local.
- **Quiz/overlay**: sem barra de progresso persistente e sem rascunho salvo em localStorage.
- **Acessibilidade**: contrastes não auditados, foco visível inconsistente, sem `aria-label` em ícones-botão.

---

## Áreas de melhoria (12 blocos)

### 1. Hero com prova social acima da dobra
- Logo bar textual: "Aprovados em USP • UFRJ • UNICAMP • UFMG • UnB".
- Stats animados (framer-motion counter): "+12.847 redações corrigidas", "Nota média 887", "98% recomendam".
- Avatares empilhados (reaproveitar fotos existentes) + 5 estrelas + "4.9/5 — 2.341 avaliações".
- Headline com efeito typewriter na palavra-chave.

### 2. Demo interativa "Antes / Depois"
- Card com toggle entre parágrafo cru (3 erros sublinhados em vermelho, tooltip explica) e versão corrigida (verde).
- Nota animando de 640 → 920 ao trocar de aba.
- Posicionar antes de "Como funciona".

### 3. Urgência real
- Banner fino topo: countdown até ENEM 2026 (04/11/2026) — "Faltam Xd Yh Zm".
- Seção planos: preço cheio R$ 49,90 riscado → R$ 19,90, badge "Oferta válida só hoje".

### 4. Prova social turbinada
- Em cada card de depoimento: bloco "640 → 920" grande no topo (gradiente red → emerald) + badge "Verificado".
- Nova seção "Galeria de notas": 6 cards simulando espelho INEP com nota 900+.

### 5. Garantia dedicada
- Seção antes do FAQ com selo circular "7 dias — Risco Zero".
- Copy: "Se você não evoluir 80 pontos, devolvemos 100%".

### 6. FAQ expandido
Adicionar mínimo: reembolso, prazo de correção, privacidade dos textos, vestibulares além do ENEM, cancelamento, suporte humano.

### 7. Planos com ancoragem + bônus
- 2 cards: Mensal R$ 19,90 vs Anual R$ 9,90/mês (economize 50%).
- Stack de bônus visível: E-book Repertório Coringa (R$ 47), Grupo VIP Telegram (R$ 97), Aulas ao vivo (R$ 197). Total tachado R$ 341 → "Hoje R$ 19,90".

### 8. CTAs contextuais
- Hero: "Analisar minha redação".
- Após dor: "Quero parar de chutar".
- Após features: "Ver minha nota agora".
- Mobile: barra fixa inferior "Testar agora →".

### 9. Design system real
- Em `src/styles.css` criar tokens semânticos em oklch: `--primary`, `--primary-glow`, `--gradient-hero`, `--shadow-elegant`, `--success`, `--danger`, `--surface`, `--surface-elevated`.
- Substituir TODAS as cores hardcoded de `index.tsx` por classes via tokens (`bg-primary`, `text-primary-foreground`, etc.). Zero `text-white`/`bg-black`/`indigo-*` soltos.
- Atualizar variantes shadcn para consumir os tokens.

### 10. SEO + compartilhamento
- Gerar `/og-image.jpg` (1200×630) com headline + nota 1000.
- Meta `og:image`, `twitter:card=summary_large_image`, `og:description`, canonical.
- JSON-LD `Product` + `AggregateRating` (4.9, 2341 reviews) no `head()` da rota.
- Title <60 chars, description <160 chars, H1 único.

### 11. Performance
- `<img>` com `loading="lazy"`, `width`, `height`, `decoding="async"`.
- Substituir Unsplash da Julia por foto local consistente.
- Pré-carregar fonte do hero, evitar layout shift.

### 12. Micro-interações + UX
- Cards de features com tilt 3D sutil no hover (framer-motion `whileHover`).
- Botão CTA primário com shimmer/glow contínuo discreto.
- Quiz + overlay de análise: barra de progresso persistente e rascunho salvo em localStorage.
- Acessibilidade: `aria-label` em todos os ícones-botão, foco visível com `--ring`, contraste AA mínimo.

---

## Prompt pronto para colar (quando quiser implementar)

```
Aprimore a landing do Destrava Redação AI (src/routes/index.tsx + src/styles.css) em
uma única passada, executando TODOS os 12 blocos abaixo. Mantenha o tom persuasivo e
a estética atual, mas suba prova social, urgência, conversão e qualidade técnica.

1. HERO: logo bar (USP, UFRJ, UNICAMP, UFMG, UnB), stats animados (12.847 redações,
   nota média 887, 98% recomendam), avatares empilhados + 4.9/5 (2.341 avaliações),
   typewriter na palavra-chave da headline.

2. DEMO ANTES/DEPOIS: card com toggle, 3 erros sublinhados vermelhos com tooltip na
   versão crua, versão corrigida em verde, nota animando 640→920. Posicionar antes
   de "Como funciona".

3. URGÊNCIA: banner topo com countdown até 04/11/2026 (ENEM). Nos planos, preço
   cheio R$49,90 riscado → R$19,90 + badge "Oferta válida só hoje".

4. DEPOIMENTOS++: bloco "640→920" gigante em gradient red→emerald no topo de cada
   card + badge "Verificado". Nova seção "Galeria de notas" com 6 espelhos INEP
   simulados destacando 900+.

5. GARANTIA: nova seção antes do FAQ, selo circular "7 dias — Risco Zero", copy
   "Se você não evoluir 80 pontos, devolvemos 100%".

6. FAQ: adicionar reembolso, prazo de correção, privacidade dos textos, vestibulares
   além do ENEM, cancelamento, suporte humano.

7. PLANOS: 2 cards (Mensal R$19,90 vs Anual R$9,90/mês -50%). Stack de bônus:
   E-book R$47 + Telegram VIP R$97 + Aulas ao vivo R$197. Total R$341 tachado →
   "Hoje R$19,90".

8. CTAs CONTEXTUAIS: hero "Analisar minha redação", pós-dor "Quero parar de chutar",
   pós-features "Ver minha nota agora", mobile com barra fixa inferior "Testar agora".

9. DESIGN SYSTEM: em src/styles.css criar tokens semânticos oklch (--primary,
   --primary-glow, --gradient-hero, --shadow-elegant, --success, --danger, --surface).
   Substituir TODAS as cores hardcoded de index.tsx por classes via tokens. Zero
   text-white/bg-black/indigo-* soltos. Atualizar variantes shadcn quando necessário.

10. SEO: gerar /og-image.jpg 1200x630 com headline + nota 1000. Meta og:image,
    twitter:card=summary_large_image, canonical, title <60, description <160, H1
    único. JSON-LD Product + AggregateRating (4.9, 2341 reviews) no head() da rota.

11. PERFORMANCE: todas as <img> com loading="lazy", width, height, decoding="async".
    Trocar Unsplash da Julia por foto local consistente.

12. UX/MICRO: tilt 3D sutil nos cards de feature, shimmer discreto no CTA primário,
    barra de progresso persistente no quiz, rascunho da redação em localStorage,
    aria-label em ícones-botão, foco visível com --ring, contraste AA mínimo.

Critérios de aceitação:
- bunx tsc --noEmit passa limpo.
- Nenhuma cor hex/tailwind hardcoded fora dos tokens.
- Rota única mantida (não criar rotas novas).
- Mobile 375px funcional com CTA fixo inferior.
- Lighthouse mobile: Performance ≥85, Acessibilidade ≥95, SEO 100.
```

---

## Como usar

Cole o bloco entre ``` no chat para rodar tudo de uma vez. Se preferir fatiar (mais seguro para revisão), peça por blocos: "implemente 1–4", depois "5–8", depois "9–12".
