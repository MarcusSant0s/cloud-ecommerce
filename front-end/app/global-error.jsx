"use client";

import { useEffect } from "react";

// Last-resort boundary: this catches errors thrown by the root layout itself,
// so it replaces RootLayout entirely and must render its own <html>/<body>.
//
// Because next/font's CSS variables and globals.css come from that layout, none
// of the Tailwind classes or brand tokens are guaranteed here — the styles below
// are inline, with the Brenda Nunes palette hard-coded, so this screen renders
// even when the CSS pipeline is part of what failed.
const COLORS = {
  offWhite: "#F7F3F1",
  text: "#3A3A3A",
  textLight: "#8A7F7A",
  black: "#1A1A1A",
  rose: "#E8C8D2",
};

const styles = {
  body: {
    alignItems: "center",
    backgroundColor: COLORS.offWhite,
    color: COLORS.text,
    display: "flex",
    fontFamily: "Georgia, 'Times New Roman', serif",
    justifyContent: "center",
    margin: 0,
    minHeight: "100vh",
    padding: "1.5rem",
  },
  wrap: { maxWidth: "32rem", textAlign: "center" },
  eyebrow: {
    color: COLORS.textLight,
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.65rem",
    fontWeight: 500,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 400,
    letterSpacing: "0.12em",
    lineHeight: 1.2,
    margin: "0.75rem 0 0",
    textTransform: "uppercase",
  },
  rule: {
    backgroundColor: COLORS.rose,
    height: "1px",
    margin: "1.5rem auto",
    width: "3rem",
  },
  text: {
    color: COLORS.textLight,
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.875rem",
    lineHeight: 1.7,
    margin: 0,
  },
  digest: {
    color: COLORS.textLight,
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.6rem",
    letterSpacing: "0.2em",
    marginTop: "0.75rem",
    textTransform: "uppercase",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    justifyContent: "center",
    marginTop: "2rem",
  },
  button: {
    backgroundColor: COLORS.black,
    border: `1px solid ${COLORS.black}`,
    borderRadius: "2px",
    color: COLORS.offWhite,
    cursor: "pointer",
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.7rem",
    letterSpacing: "0.15em",
    padding: "0.85rem 1.75rem",
    textDecoration: "none",
    textTransform: "uppercase",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    border: `1px solid ${COLORS.black}`,
    borderRadius: "2px",
    color: COLORS.black,
    cursor: "pointer",
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.7rem",
    letterSpacing: "0.15em",
    padding: "0.85rem 1.75rem",
    textDecoration: "none",
    textTransform: "uppercase",
  },
};

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={styles.body}>
        <div style={styles.wrap}>
          <span style={styles.eyebrow}>Erro inesperado</span>
          <h1 style={styles.title}>Algo deu errado</h1>
          <div style={styles.rule} />
          <p style={styles.text}>
            Não conseguimos carregar a loja no momento. Tente novamente em
            instantes.
          </p>
          {error?.digest && (
            <p style={styles.digest}>Código: {error.digest}</p>
          )}
          <div style={styles.actions}>
            <button onClick={reset} style={styles.button} type="button">
              Tentar novamente
            </button>
            {/* Intentionally a plain <a>: a soft nav would re-render the same
                broken tree, and the router may be part of what failed. A full
                document reload is the only reliable way out of this boundary. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={styles.buttonOutline}>
              Voltar para a home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
