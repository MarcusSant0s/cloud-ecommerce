"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, CheckCircle2, Clock, XCircle, ChevronRight, ArrowLeft } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const CURRENCY = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_CONFIG = {
  paid: { label: "Paid", icon: CheckCircle2, className: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  pending: { label: "Pending", icon: Clock, className: "text-amber-600 bg-amber-50 border-amber-200" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "text-red-500 bg-red-50 border-red-200" },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

// --- Skeletons ---
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

// --- Order Card ---
function OrderCard({ order }) {
  const firstItem = order.items[0];
  const extraCount = order.items.length - 1;

  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 sm:flex-row sm:items-center">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-muted">
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
                <span className="ml-1 text-muted-foreground font-normal text-sm">& {extraCount} more</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Order #{firstItem?.id}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-lg font-bold text-primary">{CURRENCY.format(order.total)}</p>
          <Link
            href={`/orders/${firstItem?.id}`}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-primary"
          >
            Details <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Empty State ---
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-1 font-semibold">No orders yet</h3>
      <p className="mb-6 text-sm text-muted-foreground">
        When you place an order, it will show up here.
      </p>
      <Link
        href="/products"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
      >
        Browse Products
      </Link>
    </div>
  );
}

// --- Error State ---
function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/30 py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="mb-1 font-semibold">Failed to load orders</h3>
      <p className="mb-6 text-sm text-muted-foreground">Something went wrong. Please try again.</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
      >
        Try again
      </button>
    </div>
  );
}

// --- Main Page ---
export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);


  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(false);
      const res = await api.get(`/order`);
      setOrders(res.data.content ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchOrders();
  }, [user?.id, authLoading]);

  const pending = orders.filter(o => o.status === "pending");
  const others = orders.filter(o => o.status !== "pending");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-10">

        {/* header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm transition hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            {!loading && !error && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {orders.length === 0
                  ? "You haven't placed any orders yet."
                  : `${orders.length} order${orders.length > 1 ? "s" : ""} total`}
              </p>
            )}
          </div>
        </div>

        {/* loading */}
        {(loading || authLoading) && (
          <div className="flex flex-col gap-8">
            <SectionSkeleton count={2} />
            <SectionSkeleton count={3} />
          </div>
        )}

        {/* error */}
        {!loading && error && <ErrorState onRetry={fetchOrders} />}

        {/* empty */}
        {!loading && !error && orders.length === 0 && <EmptyState />}

        {/* orders */}
        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-8">
            {pending.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Awaiting Payment
                </h2>
                <div className="flex flex-col gap-3">
                  {pending.map((order, i) => <OrderCard key={i} order={order} />)}
                </div>
              </section>
            )}
            {others.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Past Orders
                </h2>
                <div className="flex flex-col gap-3">
                  {others.map((order, i) => <OrderCard key={i} order={order} />)}
                </div>
              </section>
            )}
          </div>
        )}

      </div>
    </div>
  );
}