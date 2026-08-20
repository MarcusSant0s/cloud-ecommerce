"use client";

import ErrorState from "@/components/ErrorState";

export default function Error({ error, reset }) {
  return (
    <ErrorState
      description="Seus pedidos estão seguros — apenas não conseguimos exibi-los agora. Tente novamente."
      error={error}
      homeHref="/"
      homeLabel="Voltar para a home"
      reset={reset}
      title="Não foi possível carregar seus pedidos"
    />
  );
}
