"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { useOrderStatus } from "@/lib/use-order-status";

const CURRENCY = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("external_reference");

  // O Mercado Pago devolve o usuário para cá assim que aprova, mas quem grava o
  // PAID do nosso lado é o webhook, que pode chegar depois. Em vez de afirmar
  // "aprovado" sem saber, a página confere e se corrige sozinha.
  const { order, state } = useOrderStatus(orderId);
  const status = order?.status?.toUpperCase();

  if (state === "settled" && status === "CANCELLED") {
    return (
      <Shell
        icon={<XCircle className="h-10 w-10 text-red-500" />}
        iconBg="bg-red-100"
        title="Pagamento não aprovado"
      >
        <p className="text-muted-foreground">
          O pedido <span className="font-semibold text-foreground">#{orderId}</span> não foi concluído.
        </p>
        <Actions router={router} />
      </Shell>
    );
  }

  if (state === "waiting" || state === "loading") {
    return (
      <Shell
        icon={<Loader2 className="h-10 w-10 animate-spin text-emerald-600" />}
        iconBg="bg-emerald-100"
        title="Confirmando pagamento"
      >
        <p className="text-muted-foreground">
          Estamos confirmando o pagamento do pedido{" "}
          <span className="font-semibold text-foreground">#{orderId}</span>.
        </p>
        <p className="text-sm text-muted-foreground">
          Leva alguns segundos. Esta página se atualiza sozinha.
        </p>
      </Shell>
    );
  }

  if (state === "timeout" || state === "error") {
    return (
      <Shell
        icon={<Clock className="h-10 w-10 text-amber-500" />}
        iconBg="bg-amber-100"
        title="Confirmação em andamento"
      >
        <p className="text-muted-foreground">
          Recebemos seu pagamento do pedido{" "}
          <span className="font-semibold text-foreground">#{orderId}</span>, mas a confirmação ainda
          não chegou. Acompanhe em Meus Pedidos.
        </p>
        <Actions router={router} />
      </Shell>
    );
  }

  return (
    <Shell
      icon={<CheckCircle2 className="h-10 w-10 text-emerald-600" />}
      iconBg="bg-emerald-100"
      title="Pagamento aprovado!"
    >
      <p className="text-muted-foreground">
        Seu pedido <span className="font-semibold text-foreground">#{orderId}</span> foi confirmado
        {order?.total != null && <> — {CURRENCY.format(order.total)}</>}.
      </p>
      <Actions router={router} />
    </Shell>
  );
}

function Shell({ icon, iconBg, title, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className={`flex h-20 w-20 items-center justify-center rounded-full ${iconBg}`}>
          {icon}
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function Actions({ router }) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
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
  );
}

export default function OrderSuccess() {
  return (
    <Suspense>
      <OrderSuccessContent />
    </Suspense>
  );
}
