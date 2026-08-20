"use client";

import ErrorState from "@/components/ErrorState";

export default function Error({ error, reset }) {
  return (
    <ErrorState
      description="Seus dados não foram alterados. Tente novamente em instantes."
      error={error}
      homeHref="/"
      homeLabel="Voltar para a home"
      reset={reset}
      title="Não foi possível carregar sua conta"
    />
  );
}
