"use client";
import { useSearchParams } from "next/navigation";

export default function OrderPending() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("external_reference");

  return (
    <div>
      <h1>Pagamento pendente</h1>
      <p>Seu pedido #{orderId} aguarda confirmação do pagamento.</p>
      <p>Você receberá uma notificação quando for aprovado.</p>
    </div>
  );
}