"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Clock } from "lucide-react";

function OrderPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("external_reference");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold">Pagamento pendente</h1>
        <p className="text-muted-foreground">
          Seu pedido <span className="font-semibold text-foreground">#{orderId}</span> aguarda confirmação do pagamento.
        </p>
        <p className="text-sm text-muted-foreground">
          Você receberá uma notificação assim que for aprovado.
        </p>
        <button
          onClick={() => router.push("/orders")}
          className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
        >
          Ver meus pedidos
        </button>
      </div>
    </div>
  );
}

export default function OrderPending() {
  return (
    <Suspense>
      <OrderPendingContent />
    </Suspense>
  );
}
