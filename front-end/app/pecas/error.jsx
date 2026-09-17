"use client";

import ErrorState from "@/components/ErrorState";

export default function Error({ error, reset }) {
  return (
    <ErrorState
      description="Nosso catálogo não respondeu agora. Tente novamente em instantes."
      error={error}
      homeHref="/"
      homeLabel="Voltar para a home"
      reset={reset}
      title="Não foi possível carregar os produtos"
    />
  );
}
