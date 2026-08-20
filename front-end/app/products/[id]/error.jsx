"use client";

import ErrorState from "@/components/ErrorState";

export default function Error({ error, reset }) {
  return (
    <ErrorState
      description="Não conseguimos buscar os detalhes deste item. Tente novamente em instantes."
      error={error}
      homeHref="/products"
      homeLabel="Ver todos os produtos"
      reset={reset}
      title="Não foi possível carregar este produto"
    />
  );
}
