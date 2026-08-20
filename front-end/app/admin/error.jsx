"use client";

import ErrorState from "@/components/ErrorState";

export default function Error({ error, reset }) {
  return (
    <ErrorState
      description="O servidor não respondeu a tempo. Tente novamente em instantes."
      error={error}
      homeHref="/admin"
      homeLabel="Voltar para o painel"
      reset={reset}
      title="Não foi possível carregar o painel"
    />
  );
}
