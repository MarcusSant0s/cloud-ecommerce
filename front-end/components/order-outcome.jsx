"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, Clock, XCircle, Loader2, Package, SearchX,
} from "lucide-react";
import { useOrderStatus } from "@/lib/use-order-status";

const CURRENCY = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Tela de retorno do Mercado Pago.
 *
 * Separa dois fatos que antes vinham misturados: o pedido **existe** — certo e
 * imediato, é o que o usuário precisa ver assim que volta — e o pagamento, que
 * no Pix pode levar minutos. A manchete afirma o primeiro; o segundo vive num
 * bloco à parte que se resolve sozinho, sem exigir recarregar a página.
 *
 * `outcome` é apenas a expectativa que a MP sinalizou pela URL de retorno. Quem
 * manda no que aparece é o status do nosso banco.
 */
export function OrderOutcome({ orderId, outcome = "pending" }) {
  const router = useRouter();

  // Num retorno de falha a MP já disse que não houve pagamento: consulta uma vez
  // para montar o resumo, sem ficar esperando algo que não vem.
  const { order, state } = useOrderStatus(orderId, { poll: outcome !== "failed" });
  const status = order?.status?.toUpperCase();

  if (state === "notfound") {
    return (
      <Shell icon={<SearchX className="h-10 w-10 text-muted-foreground" />} iconBg="bg-muted">
        <h1 className="text-2xl font-bold">Pedido não encontrado</h1>
        <p className="text-muted-foreground">
          Não localizamos {orderId ? <>o pedido <span className="font-semibold text-foreground">#{orderId}</span></> : "este pedido"} na sua conta.
          Se você acabou de pagar, ele aparece em Meus Pedidos.
        </p>
        <Actions router={router} />
      </Shell>
    );
  }

  const itemCount = (order?.items ?? []).reduce((sum, i) => sum + (i.quantity ?? 0), 0);

  return (
    <Shell
      icon={<CheckCircle2 className="h-10 w-10 text-emerald-600" />}
      iconBg="bg-emerald-100"
    >
      <div>
        <h1 className="text-2xl font-bold">Pedido realizado!</h1>
        <p className="mt-1 text-muted-foreground">
          Seu pedido <span className="font-semibold text-foreground">#{orderId}</span> foi registrado.
        </p>
      </div>

      {order && (
        <div className="w-full rounded-xl border bg-card p-4 text-left">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "itens"}
            </span>
            <span className="text-lg font-bold text-primary tabular-nums">
              {CURRENCY.format(order.total ?? 0)}
            </span>
          </div>

          <ul className="mt-3 flex flex-col gap-2">
            {(order.items ?? []).slice(0, 3).map((item, i) => (
              <li key={item.id ?? `${item.productId}-${i}`} className="flex items-center gap-2.5">
                <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                  {item.url ? (
                    <Image src={item.url} alt={item.productName} fill sizes="36px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className="min-w-0 flex-1 truncate text-sm">{item.productName}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {item.quantity}×
                </span>
              </li>
            ))}
            {(order.items ?? []).length > 3 && (
              <li className="text-xs text-muted-foreground">
                e mais {order.items.length - 3}
              </li>
            )}
          </ul>
        </div>
      )}

      <PaymentStatus state={state} status={status} outcome={outcome} />

      <Actions router={router} showPayAgain={status === "PENDING" && outcome === "failed"} />
    </Shell>
  );
}

function PaymentStatus({ state, status, outcome }) {
  if (status === "PAID") {
    return (
      <Row tone="emerald" icon={<CheckCircle2 className="h-4 w-4" />}>
        <strong className="font-semibold">Pagamento confirmado.</strong> Já estamos preparando seu envio.
      </Row>
    );
  }

  if (status === "CANCELLED") {
    return (
      <Row tone="red" icon={<XCircle className="h-4 w-4" />}>
        <strong className="font-semibold">Pagamento não concluído.</strong> Os itens voltaram para o seu carrinho.
      </Row>
    );
  }

  if (outcome === "failed") {
    return (
      <Row tone="red" icon={<XCircle className="h-4 w-4" />}>
        <strong className="font-semibold">Pagamento não concluído.</strong> O pedido continua em aberto — dá para pagar de novo em Meus Pedidos.
      </Row>
    );
  }

  if (state === "timeout" || state === "error") {
    return (
      <Row tone="amber" icon={<Clock className="h-4 w-4" />}>
        <strong className="font-semibold">Confirmação ainda pendente.</strong> Assim que o banco confirmar, o pedido aparece como pago em Meus Pedidos.
      </Row>
    );
  }

  return (
    <Row tone="amber" icon={<Loader2 className="h-4 w-4 animate-spin" />}>
      <strong className="font-semibold">Confirmando o pagamento.</strong> Pagamentos por Pix levam alguns segundos — esta página se atualiza sozinha.
    </Row>
  );
}

const TONES = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-700",
};

function Row({ tone, icon, children }) {
  return (
    <div className={`flex w-full items-start gap-2.5 rounded-xl border px-4 py-3 text-left text-sm ${TONES[tone]}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

function Shell({ icon, iconBg, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
        <div className={`flex h-20 w-20 items-center justify-center rounded-full ${iconBg}`}>
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}

function Actions({ router, showPayAgain = false }) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
      <Link
        href="/orders"
        className="w-full rounded-xl bg-primary px-5 py-2.5 text-center text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
      >
        {showPayAgain ? "Pagar novamente" : "Ver meus pedidos"}
      </Link>
      <button
        onClick={() => router.push("/pecas")}
        className="w-full rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-accent sm:w-auto"
      >
        Continuar comprando
      </button>
    </div>
  );
}
