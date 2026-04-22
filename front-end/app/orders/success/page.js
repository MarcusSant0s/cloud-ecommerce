"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import api from "@/services/api";

export default function OrderSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("external_reference");

  useEffect(() => {
    if (!orderId) return;
    // notify backend — optional if you have webhook
    api.patch(`/order/${orderId}/confirm`, { paymentId })
      .catch(console.error);
  }, [orderId]);

  return (
    <div>
      <h1>Pagamento aprovado!</h1>
      <p>Seu pedido #{orderId} foi confirmado.</p>
      <button onClick={() => router.push("/products")}>
        Continuar comprando
      </button>
    </div>
  );
}