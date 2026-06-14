"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import api from "@/services/api";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("external_reference");

  useEffect(() => {
    if (!orderId) return;
    api.patch(`/order/${orderId}/confirm`, { paymentId }).catch(console.error);
  }, [orderId]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold">Pagamento aprovado!</h1>
        <p className="text-muted-foreground">
          Seu pedido <span className="font-semibold text-foreground">#{orderId}</span> foi confirmado com sucesso.
        </p>
        <div className="flex flex-col gap-2 w-full sm:flex-row sm:justify-center">
          <button
            onClick={() => router.push("/orders")}
            className="w-full rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-accent sm:w-auto"
          >
            Ver meus pedidos
          </button>
          <button
            onClick={() => router.push("/products")}
            className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
          >
            Continuar comprando
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccess() {
  return (
    <Suspense>
      <OrderSuccessContent />
    </Suspense>
  );
}
