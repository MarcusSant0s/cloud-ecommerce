"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export default function HeroBanner() {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();

  // Progresso de 0 a 1 enquanto o hero sai da tela. Escopo na própria seção, não
  // no scroll global: assim o efeito não depende de onde o hero está na página.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Encolhe e desvanece conforme sobe. Só transform e opacity — ambos rodam na
  // GPU, sem recalcular layout a cada frame.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  // A dica de rolagem cumpriu o papel no instante em que a pessoa rolou.
  const hintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Movimento ligado a rolagem é dos que mais incomodam quem tem sensibilidade
  // vestibular — com reduced motion, a seção fica parada.
  const motionStyle = reduceMotion ? undefined : { scale, opacity };

  return (
    <section
      ref={ref}
      className="relative flex h-dvh flex-col items-center justify-center overflow-hidden text-center md:h-auto md:min-h-[92vh]"
      style={{ background: "var(--bn-black)" }}
    >
      {/* Ambient gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(232,200,210,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 80% 80%, rgba(212,180,131,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-6"
        style={motionStyle}
      >
        {/* BN Monogram */}
        <div className="mb-8 w-[clamp(80px,14vw,130px)]">
          <svg
            aria-label="Brenda Nunes monograma BN"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" fill="none" r="44" stroke="#D4B483" strokeWidth="0.7" />
            <circle cx="50" cy="50" fill="none" r="41" stroke="#D4B483" strokeDasharray="2 4" strokeWidth="0.25" />
            {/* B */}
            <line stroke="#D4B483" strokeLinecap="square" strokeWidth="1.25" x1="22" x2="22" y1="20" y2="80" />
            <line stroke="#D4B483" strokeLinecap="square" strokeWidth="1" x1="18.5" x2="26" y1="20" y2="20" />
            <line stroke="#D4B483" strokeLinecap="square" strokeWidth="1" x1="18.5" x2="26" y1="80" y2="80" />
            <line stroke="#D4B483" strokeLinecap="square" strokeWidth="0.8" x1="22" x2="26" y1="50" y2="50" />
            <path d="M 22,20 C 36,20 45,26 45,38 C 45,50 36,50 22,50" fill="none" stroke="#D4B483" strokeLinecap="round" strokeWidth="1.25" />
            <path d="M 22,50 C 38,50 49,57 49,66 C 49,76 38,80 22,80" fill="none" stroke="#D4B483" strokeLinecap="round" strokeWidth="1.25" />
            {/* N */}
            <line stroke="#D4B483" strokeLinecap="square" strokeWidth="1.25" x1="53" x2="53" y1="20" y2="80" />
            <line stroke="#D4B483" strokeLinecap="square" strokeWidth="1" x1="49.5" x2="57" y1="20" y2="20" />
            <line stroke="#D4B483" strokeLinecap="square" strokeWidth="1" x1="49.5" x2="57" y1="80" y2="80" />
            <line stroke="#D4B483" strokeLinecap="square" strokeWidth="1.25" x1="75" x2="75" y1="20" y2="80" />
            <line stroke="#D4B483" strokeLinecap="square" strokeWidth="1" x1="71.5" x2="78.5" y1="20" y2="20" />
            <line stroke="#D4B483" strokeLinecap="square" strokeWidth="1" x1="71.5" x2="78.5" y1="80" y2="80" />
            <line stroke="#D4B483" strokeLinecap="round" strokeWidth="1.25" x1="53" x2="75" y1="20" y2="80" />
          </svg>
        </div>

        {/* Eyebrow label */}
        <p className="bn-label mb-6">Nova Coleção · Primavera 2025</p>

        {/* Brand name */}
        <h1
          className="bn-brand-name mb-4"
          style={{
            color: "var(--bn-off-white)",
            fontSize: "clamp(1.2rem, 4vw, 2rem)",
          }}
        >
          Brenda Nunes
        </h1>

        {/* Italic tagline */}
        <p
          style={{
            fontFamily: "var(--bn-font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(1.1rem, 3vw, 1.6rem)",
            letterSpacing: "0.06em",
            color: "rgba(247,243,241,0.65)",
            marginBottom: "2.5rem",
            maxWidth: "520px",
            lineHeight: 1.5,
          }}
        >
          &ldquo;Elegância não é ser notada — é ser lembrada.&rdquo;
        </p>

        {/* Gold divider */}
        <div className="bn-divider mb-10" />

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link className="bn-btn bn-btn-gold" href="/pecas">
            Explorar Coleção
          </Link>
          <Link
            className="bn-btn bn-btn-ghost"
            href="/pecas"
          >
            Ver Novidades
          </Link>
        </div>
      </motion.div>

      {/* Bottom scroll hint */}
      <motion.div
        aria-hidden
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{
          fontFamily: "var(--bn-font-body)",
          fontWeight: 200,
          fontSize: "0.6rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(247,243,241,0.2)",
          ...(reduceMotion ? null : { opacity: hintOpacity }),
        }}
      >
        Deslize para explorar
      </motion.div>
    </section>
  );
}
