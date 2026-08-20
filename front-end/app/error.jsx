"use client";

import ErrorState from "@/components/ErrorState";

export default function Error({ error, reset }) {
  return (
    <ErrorState
      description="Tivemos um problema inesperado. Tente novamente em instantes."
      error={error}
      homeHref="/"
      homeLabel="Voltar para a home"
      reset={reset}
      title="Não foi possível carregar esta página"
    />
  );
}
