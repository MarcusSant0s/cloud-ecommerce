"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/primitives/button";

const ACTION_CLASS =
  "rounded-sm text-[0.7rem] uppercase tracking-[0.15em]";

/**
 * Shared fallback UI for the route error boundaries and the 404 page.
 *
 * `reset` comes from Next's error boundary — omit it (as the 404 does) and the
 * retry button is dropped. `error` is only used for logging; its message is
 * never shown, since in production it is a redacted digest anyway.
 */
export default function ErrorState({
  title,
  description = "Tente novamente em instantes. Se o problema continuar, volte mais tarde.",
  eyebrow = "Algo deu errado",
  error,
  reset,
  showHome = true,
  homeHref = "/",
  homeLabel = "Voltar para a home",
  secondaryHref,
  secondaryLabel,
}) {
  useEffect(() => {
    // Surfaces the stack in the container logs; the user only sees the copy above.
    if (error) console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        {eyebrow}
      </span>

      <h1 className="mt-3 max-w-xl font-display text-3xl font-normal uppercase leading-tight tracking-[0.12em] md:text-4xl">
        {title}
      </h1>

      <div className="mt-4 h-px w-12 bg-foreground/30" />

      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {error?.digest && (
        <p className="mt-3 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/70">
          Código: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {reset && (
          <Button className={ACTION_CLASS} onClick={reset}>
            Tentar novamente
          </Button>
        )}
        {showHome && (
          <Button asChild className={ACTION_CLASS} variant="outline">
            <Link href={homeHref}>{homeLabel}</Link>
          </Button>
        )}
        {secondaryHref && (
          <Button asChild className={ACTION_CLASS} variant="ghost">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
