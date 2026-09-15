"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useOrderStatus } from "@/lib/use-order-status";

const CURRENCY = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function OrderPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("external_reference");

  const { order, state } = useOrderStatus(orderId);
  const status = order?.status?.toUpperCase();

  // O pagamento caiu enquanto a página estava aberta — a tela vira sozinha,
  // sem o usuário precisar voltar ou recarregar.
  if (state === "settled" && status === "PAID") {
    return (
      <Shell
        icon={<CheckCircle2 className="h-10 w-10 text-emerald-600" />}
        iconBg="bg-emerald-100"
        title="Pagamento confirmado!"
      >
        <p className="text-muted-foreground">
          Seu pedido <span className="font-semibold text-foreground">#{orderId}</span> foi confirmado
          {order?.total != null && <> — {CURRENCY.format(order.total)}</>}.
        </p>
        <Actions router={router} />
      </Shell>
    );
  }

  if (state === "settled" && status === "CANCELLED") {
    return (
      <Shell
        icon={<XCircle className="h-10 w-10 text-red-500" />}
        iconBg="bg-red-100"
        title="Pagamento não concluído"
      >
        <p className="text-muted-foreground">
          O pedido <span className="font-semibold text-foreground">#{orderId}</span> foi cancelado.
          Os itens voltaram para o seu carrinho.
        </p>
        <Actions router={router} />
      </Shell>
    );
  }

  if (state === "timeout") {
    return (
      <Shell
        icon={<Clock className="h-10 w-10 text-amber-500" />}
        iconBg="bg-amber-100"
        title="Ainda aguardando confirmação"
      >
        <p className="text-muted-foreground">
          O pagamento do pedido <span className="font-semibold text-foreground">#{orderId}</span> ainda
          não foi confirmado. Ele aparece como pago em Meus Pedidos assim que o banco confirmar.
        </p>
        <Actions router={router} />
      </Shell>
    );
  }

  return (
    <Shell
      icon={
        state === "error"
          ? <Clock className="h-10 w-10 text-amber-500" />
          : <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      }
      iconBg="bg-amber-100"
      title="Aguardando confirmação"
    >
      <p className="text-muted-foreground">
        Seu pedido <span className="font-semibold text-foreground">#{orderId}</span> está aguardando a
        confirmação do pagamento.
      </p>
      <p className="text-sm text-muted-foreground">
        Pagamentos por Pix costumam levar alguns segundos.
        <span className="block">Pode deixar esta página aberta — ela se atualiza sozinha.</span>
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
        className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
      >
        Ver meus pedidos
      </button>
      <button
        onClick={() => router.push("/products")}
        className="w-full rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-accent sm:w-auto"
      >
        Continuar comprando
      </button>
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
