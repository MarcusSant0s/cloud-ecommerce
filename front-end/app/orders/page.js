"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, CheckCircle2, Clock, XCircle, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const CURRENCY = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const STATUS_CONFIG = {
  PAID: { label: "Pago", icon: CheckCircle2, className: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  PENDING: { label: "Pendente", icon: Clock, className: "text-amber-600 bg-amber-50 border-amber-200" },
  CANCELLED: { label: "Cancelado", icon: XCircle, className: "text-red-500 bg-red-50 border-red-200" },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status?.toUpperCase()] ?? STATUS_CONFIG.PENDING;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center animate-pulse">
      <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-muted" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
          <div className="h-6 w-16 rounded-full bg-muted" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="h-5 w-24 rounded bg-muted" />
          <div className="h-3 w-12 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton({ count = 3 }) {
  return (
    <section>
      <div className="mb-3 h-3 w-32 rounded bg-muted animate-pulse" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

function OrderCard({ order }) {
  const firstItem = order.items?.[0];
  const extraCount = (order.items?.length ?? 0) - 1;
  const date = order.createdAt ? DATE_FORMAT.format(new Date(order.createdAt)) : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 sm:flex-row sm:items-center sm:p-5">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border bg-muted sm:h-20 sm:w-20">
        {firstItem?.url ? (
          <Image src={firstItem.url} alt={firstItem.productName} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        {extraCount > 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-sm font-bold text-white">
            +{extraCount}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold leading-tight line-clamp-1">
              {firstItem?.productName}
              {extraCount > 0 && (
                <span className="ml-1 text-muted-foreground font-normal text-sm">e mais {extraCount}</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pedido #{order.id}
              {date && <span className="ml-2">· {date}</span>}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-lg font-bold text-primary">{CURRENCY.format(order.total)}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-1 font-semibold">Nenhum pedido ainda</h3>
      <p className="mb-6 text-sm text-muted-foreground">
        Quando você fizer um pedido, ele aparecerá aqui.
      </p>
      <Link
        href="/products"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
      >
        Ver Produtos
      </Link>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/30 py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="mb-1 font-semibold">Falha ao carregar pedidos</h3>
      <p className="mb-6 text-sm text-muted-foreground">Algo deu errado. Tente novamente.</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="flex h-8 w-8 items-center justify-center rounded-full border bg-background transition hover:bg-accent disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-muted-foreground">
        {page + 1} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="flex h-8 w-8 items-center justify-center rounded-full border bg-background transition hover:bg-accent disabled:opacity-40"
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchOrders = async (pageNum = 0) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(false);
      const res = await api.get(`/order?page=${pageNum}&size=10`);
      setOrders(res.data.content ?? []);
      setTotalPages(res.data.totalPages ?? 0);
      setTotalElements(res.data.totalElements ?? 0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchOrders(page);
  }, [user?.id, authLoading, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pending = orders.filter(o => o.status?.toUpperCase() === "PENDING");
  const others = orders.filter(o => o.status?.toUpperCase() !== "PENDING");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8 md:py-10">

        <div className="mb-6 flex items-center gap-4 md:mb-8">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm transition hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Meus Pedidos</h1>
            {!loading && !error && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {totalElements === 0
                  ? "Você ainda não fez nenhum pedido."
                  : `${totalElements} pedido${totalElements > 1 ? "s" : ""} no total`}
              </p>
            )}
          </div>
        </div>

        {(loading || authLoading) && (
          <div className="flex flex-col gap-8">
            <SectionSkeleton count={2} />
            <SectionSkeleton count={3} />
          </div>
        )}

        {!loading && error && <ErrorState onRetry={() => fetchOrders(page)} />}
        {!loading && !error && orders.length === 0 && <EmptyState />}

        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-8">
            {pending.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Aguardando Pagamento
                </h2>
                <div className="flex flex-col gap-3">
                  {pending.map((order) => <OrderCard key={order.id} order={order} />)}
                </div>
              </section>
            )}
            {others.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Pedidos Anteriores
                </h2>
                <div className="flex flex-col gap-3">
                  {others.map((order) => <OrderCard key={order.id} order={order} />)}
                </div>
              </section>
            )}
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}

      </div>
    </div>
  );
}
