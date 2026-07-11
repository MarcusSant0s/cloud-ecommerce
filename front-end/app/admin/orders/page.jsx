"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2, MapPin, Package, Mail, Phone } from "lucide-react";
import api from "@/services/api";
import { Button } from "@/primitives/button";
import { Badge } from "@/primitives/badge";
import { Skeleton } from "@/primitives/skeleton";

const STATUSES = ["PENDING", "PAID", "CANCELLED", "REFUNDED"];

const STATUS_VARIANT = {
  PENDING: "secondary",
  PAID: "default",
  CANCELLED: "destructive",
  REFUNDED: "outline",
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(dateStr)
  );
}

function formatCep(cep) {
  if (!cep) return "—";
  const digits = String(cep).replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : cep;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const res = await api.get("/order/all", { params: { page: p, size: 15 } });
      setOrders(res.data.content ?? res.data);
      setTotalPages(res.data.totalPages ?? 1);
    } catch {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(page);
  }, [page, fetchOrders]);

  async function handleUpdateStatus(orderId) {
    const status = pendingStatus[orderId];
    if (!status) return;
    setUpdatingId(orderId);
    try {
      await api.patch(`/order/${orderId}/status`, null, { params: { orderStatus: status } });
      toast.success("Order status updated.");
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status } : o))
      );
      setPendingStatus(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">View and update order statuses</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders found.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => {
                const currentStatus = (order.status ?? "").toUpperCase();
                const selected = pendingStatus[order.id] ?? currentStatus;
                const changed = selected !== currentStatus;
                const isUpdating = updatingId === order.id;
                const customerName =
                  order.customer
                    ? `${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`.trim() || order.customer.email
                    : "—";
                const total =
                  order.total ?? order.totalAmount ?? order.totalPrice ?? 0;
                const isExpanded = expandedId === order.id;
                const addr = order.shippingAddress;
                const items = order.items ?? [];

                return (
                  <Fragment key={order.id}>
                  <tr className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => setExpandedId(prev => (prev === order.id ? null : order.id))}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Hide shipping details" : "Show shipping details"}
                        className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                      >
                        <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        #{order.id}
                      </button>
                    </td>
                    <td className="px-4 py-3">{customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(order.createdAt ?? order.orderDate)}
                    </td>
                    <td className="px-4 py-3">{BRL.format(total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[currentStatus] ?? "secondary"}>
                        {currentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={selected}
                          onChange={e =>
                            setPendingStatus(prev => ({ ...prev, [order.id]: e.target.value }))
                          }
                          className="h-8 rounded-md border bg-background px-2 text-sm
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          disabled={isUpdating}
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          disabled={!changed || isUpdating}
                          onClick={() => handleUpdateStatus(order.id)}
                        >
                          {isUpdating
                            ? <Loader2 size={14} className="animate-spin" />
                            : "Save"
                          }
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-muted/20">
                      <td colSpan={6} className="px-4 py-5">
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Shipping destination */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              <MapPin size={14} /> Ship to
                            </h4>
                            {addr ? (
                              <address className="text-sm not-italic leading-relaxed">
                                <div className="font-medium text-foreground">{customerName}</div>
                                <div>{addr.street}{addr.number ? `, ${addr.number}` : ""}</div>
                                {addr.bairro && <div>{addr.bairro}</div>}
                                <div>{addr.city}</div>
                                <div>CEP {formatCep(addr.cep)}</div>
                                {(addr.phone || order.customer?.email) && (
                                  <div className="mt-1 space-y-0.5 text-muted-foreground">
                                    {addr.phone && (
                                      <div className="flex items-center gap-1.5">
                                        <Phone size={13} /> {addr.phone}
                                      </div>
                                    )}
                                    {order.customer?.email && (
                                      <div className="flex items-center gap-1.5">
                                        <Mail size={13} /> {order.customer.email}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </address>
                            ) : (
                              <p className="text-sm font-medium text-destructive">
                                No delivery address on file — cannot ship this order.
                              </p>
                            )}
                          </div>

                          {/* Pack list */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              <Package size={14} /> Items to ship
                            </h4>
                            {items.length > 0 ? (
                              <ul className="space-y-1.5 text-sm">
                                {items.map(item => (
                                  <li
                                    key={item.id ?? item.productId}
                                    className="flex items-center justify-between gap-3"
                                  >
                                    <span className="text-foreground">
                                      <span className="font-medium tabular-nums">{item.quantity}×</span>{" "}
                                      {item.productName}
                                    </span>
                                    <span className="shrink-0 text-muted-foreground">
                                      {BRL.format((item.unitPrice ?? 0) * item.quantity)}
                                    </span>
                                  </li>
                                ))}
                                <li className="flex items-center justify-between gap-3 border-t pt-1.5 text-muted-foreground">
                                  <span>Shipping</span>
                                  <span>{BRL.format(order.shippingCost ?? 0)}</span>
                                </li>
                                <li className="flex items-center justify-between gap-3 font-medium text-foreground">
                                  <span>Total</span>
                                  <span>{BRL.format(total)}</span>
                                </li>
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">No items.</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-3 mt-4 text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={16} />
          </Button>
          <span>Page {page + 1} / {totalPages}</span>
          <Button
            variant="outline"
            size="icon"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
