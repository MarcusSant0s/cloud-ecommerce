"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OrderOutcome } from "@/components/order-outcome";

function Content() {
  const searchParams = useSearchParams();
  // A MP acrescenta external_reference nas URLs de retorno; é o id do pedido.
  return <OrderOutcome orderId={searchParams.get("external_reference")} outcome="failed" />;
}

export default function Page() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  );
}
