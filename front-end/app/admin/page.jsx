"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle, CheckCircle2, Clock, Layers, Loader2, MapPinOff, Package,
  PackageCheck, RefreshCw, ShoppingBag, Tag, Truck, Users,
} from "lucide-react";
import api from "@/services/api";
import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";
import { Skeleton } from "@/primitives/skeleton";

const SECTIONS = [
  { href: "/admin/orders", icon: ShoppingBag, title: "Pedidos" },
  { href: "/admin/products", icon: Package, title: "Produtos" },
  { href: "/admin/categories", icon: Tag, title: "Categorias" },
  { href: "/admin/collections", icon: Layers, title: "Coleções" },
  { href: "/admin/users", icon: Users, title: "Usuários" },
];

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const RELATIVE = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

// "há 3 dias", "há 5 horas" — o painel é sobre quanto tempo cada pedido está parado.
function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const hours = (Date.now() - new Date(dateStr).getTime()) / 36e5;
  if (hours < 1) return "agora há pouco";
  if (hours < 24) return RELATIVE.format(-Math.floor(hours), "hour");
  return RELATIVE.format(-Math.floor(hours / 24), "day");
}

function customerName(order) {
  const c = order.customer;
  if (!c) return "—";
  return `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || c.email;
}

function itemsSummary(order) {
  return (order.items ?? []).map(i => `${i.quantity}× ${i.productName}`).join(", ");
}

const ALERTS = {
  LATE_SHIPMENT: { label: "Envio atrasado", icon: AlertTriangle, className: "border-destructive/40 bg-destructive/10 text-destructive" },
  NO_ADDRESS: { label: "Sem endereço", icon: MapPinOff, className: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400" },
  LONG_IN_TRANSIT: { label: "Muito tempo em trânsito", icon: Clock, className: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400" },
};

function AlertBadge({ alert }) {
  const cfg = ALERTS[alert];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cfg.className}>
      <Icon /> {cfg.label}
    </Badge>
  );
}

function StatTile({ icon: Icon, label, value, hint, tone = "neutral", active, onClick }) {
  const toneClass = {
    neutral: "text-foreground",
    danger: value > 0 ? "text-destructive" : "text-foreground",
    warning: value > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col gap-1 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent sm:p-4 ${
        active ? "ring-2 ring-primary" : ""
      }`}
    >
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon size={14} /> {label}
      </span>
      <span className={`text-2xl font-bold tabular-nums ${toneClass}`}>{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </button>
  );
}

function OrderMeta({ order }) {
  const addr = order.shippingAddress;
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Link href="/admin/orders" className="font-semibold hover:underline">
          #{order.id} · {customerName(order)}
        </Link>
        <span className="text-sm font-medium tabular-nums">{BRL.format(order.total ?? 0)}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{itemsSummary(order) || "Sem itens"}</p>
      {addr && (
        <p className="mt-1 text-xs text-muted-foreground">
          {addr.city}{addr.cep ? ` · CEP ${addr.cep}` : ""}
        </p>
      )}
    </>
  );
}

function AwaitingCard({ entry, onShipped }) {
  const { order, alerts } = entry;
  const [open, setOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [saving, setSaving] = useState(false);
  const noAddress = alerts.includes("NO_ADDRESS");

  async function handleShip(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/order/${order.id}/ship`, { trackingCode });
      toast.success(`Pedido #${order.id} marcado como enviado.`);
      onShipped();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Falha ao marcar como enviado.");
      setSaving(false);
    }
  }

  return (
    <li className="rounded-lg border bg-card p-3 sm:p-4">
      {alerts.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {alerts.map(a => <AlertBadge key={a} alert={a} />)}
        </div>
      )}
      <OrderMeta order={order} />
      <p className="mt-1 text-xs text-muted-foreground">Pago {timeAgo(order.paidAt ?? order.createdAt)}</p>

      {noAddress ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Peça o endereço ao cliente{order.customer?.email ? ` (${order.customer.email})` : ""} antes de enviar.
        </p>
      ) : open ? (
        <form onSubmit={handleShip} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            autoFocus
            value={trackingCode}
            onChange={e => setTrackingCode(e.target.value.toUpperCase())}
            placeholder="Código de rastreio (opcional)"
            aria-label="Código de rastreio"
            maxLength={64}
            autoCapitalize="characters"
            spellCheck={false}
            className="h-10 sm:flex-1"
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-10 flex-1 sm:flex-none" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="h-10 flex-[2] sm:flex-none" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Truck />} Confirmar envio
            </Button>
          </div>
        </form>
      ) : (
        <Button className="mt-3 h-10 w-full sm:w-auto" onClick={() => setOpen(true)}>
          <Truck /> Marcar como enviado
        </Button>
      )}
    </li>
  );
}

function InTransitCard({ entry, onDelivered }) {
  const { order, alerts } = entry;
  const [saving, setSaving] = useState(false);

  async function handleDelivered() {
    setSaving(true);
    try {
      await api.patch(`/order/${order.id}/status`, null, { params: { orderStatus: "DELIVERED" } });
      toast.success(`Pedido #${order.id} marcado como entregue.`);
      onDelivered();
    } catch {
      toast.error("Falha ao marcar como entregue.");
      setSaving(false);
    }
  }

  return (
    <li className="rounded-lg border bg-card p-3 sm:p-4">
      {alerts.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {alerts.map(a => <AlertBadge key={a} alert={a} />)}
        </div>
      )}
      <OrderMeta order={order} />
      <p className="mt-1 text-xs text-muted-foreground">
        Enviado {timeAgo(order.shippedAt)}
        {order.trackingCode && (
          <> · Rastreio <span className="font-mono text-foreground select-all">{order.trackingCode}</span></>
        )}
      </p>
      <Button variant="outline" className="mt-3 h-10 w-full sm:w-auto" onClick={handleDelivered} disabled={saving}>
        {saving ? <Loader2 className="animate-spin" /> : <PackageCheck />} Marcar como entregue
      </Button>
    </li>
  );
}

function EmptyQueue({ children }) {
  return (
    <p className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      <CheckCircle2 size={16} className="text-emerald-600" /> {children}
    </p>
  );
}

// Filtros dos cards de resumo. Cada um diz em qual fila e com qual alerta procurar.
const FILTERS = {
  awaiting: { queue: "awaitingShipment" },
  late: { queue: "awaitingShipment", alert: "LATE_SHIPMENT" },
  noAddress: { queue: "awaitingShipment", alert: "NO_ADDRESS" },
  inTransit: { queue: "inTransit" },
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(null);

  const fetchOverview = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get("/order/admin/attention");
      setData(res.data);
    } catch {
      toast.error("Falha ao carregar os pedidos pendentes de envio.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const counts = useMemo(() => {
    const awaiting = data?.awaitingShipment ?? [];
    const transit = data?.inTransit ?? [];
    const withAlert = (list, alert) => list.filter(e => e.alerts.includes(alert)).length;
    return {
      awaiting: awaiting.length,
      late: withAlert(awaiting, "LATE_SHIPMENT"),
      noAddress: withAlert(awaiting, "NO_ADDRESS"),
      inTransit: transit.length,
      stuck: withAlert(transit, "LONG_IN_TRANSIT"),
    };
  }, [data]);

  const visible = (queue) => {
    const list = data?.[queue] ?? [];
    if (!filter) return list;
    const f = FILTERS[filter];
    if (f.queue !== queue) return [];
    return f.alert ? list.filter(e => e.alerts.includes(f.alert)) : list;
  };

  const toggle = (key) => setFilter(prev => (prev === key ? null : key));
  const showAwaiting = !filter || FILTERS[filter].queue === "awaitingShipment";
  const showTransit = !filter || FILTERS[filter].queue === "inTransit";
  const awaitingList = visible("awaitingShipment");
  const transitList = visible("inTransit");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Painel</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Pedidos que ainda precisam sair ou chegar.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchOverview} disabled={refreshing} aria-label="Atualizar">
          <RefreshCw className={refreshing ? "animate-spin" : ""} />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      ) : !data ? (
        <Button variant="outline" onClick={fetchOverview}>Tentar novamente</Button>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile icon={Package} label="Aguardando envio" value={counts.awaiting}
              active={filter === "awaiting"} onClick={() => toggle("awaiting")} />
            <StatTile icon={AlertTriangle} label="Envio atrasado" value={counts.late} tone="danger"
              hint={`Pagos há mais de ${data.shippingSlaDays} dias`}
              active={filter === "late"} onClick={() => toggle("late")} />
            <StatTile icon={MapPinOff} label="Sem endereço" value={counts.noAddress} tone="warning"
              active={filter === "noAddress"} onClick={() => toggle("noAddress")} />
            <StatTile icon={Truck} label="Em trânsito" value={counts.inTransit}
              tone={counts.stuck > 0 ? "warning" : "neutral"}
              hint={counts.stuck > 0 ? `${counts.stuck} há mais de ${data.transitAlertDays} dias` : undefined}
              active={filter === "inTransit"} onClick={() => toggle("inTransit")} />
          </div>

          {filter && (
            <button type="button" onClick={() => setFilter(null)} className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:underline">
              Limpar filtro
            </button>
          )}

          {showAwaiting && (
            <section className="mt-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Package size={16} /> Para enviar
              </h2>
              {awaitingList.length === 0 ? (
                <EmptyQueue>{filter ? "Nenhum pedido neste filtro." : "Nenhum pedido pago esperando envio."}</EmptyQueue>
              ) : (
                <ul className="space-y-3">
                  {awaitingList.map(entry => (
                    <AwaitingCard key={entry.order.id} entry={entry} onShipped={fetchOverview} />
                  ))}
                </ul>
              )}
            </section>
          )}

          {showTransit && (
            <section className="mt-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Truck size={16} /> Em trânsito
              </h2>
              {transitList.length === 0 ? (
                <EmptyQueue>Nenhum pedido a caminho.</EmptyQueue>
              ) : (
                <ul className="space-y-3">
                  {transitList.map(entry => (
                    <InTransitCard key={entry.order.id} entry={entry} onDelivered={fetchOverview} />
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}

      <nav className="mt-10 border-t pt-6" aria-label="Seções do painel">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Gerenciar</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {SECTIONS.map(({ href, icon: Icon, title }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2 rounded-lg border bg-card px-3 py-3 text-sm font-medium transition-colors hover:bg-accent">
              <Icon size={16} className="text-primary" /> {title}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
