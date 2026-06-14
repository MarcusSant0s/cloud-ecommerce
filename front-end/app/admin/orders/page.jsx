"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import api from "@/services/api";
import { Button } from "@/primitives/button";
import { Badge } from "@/primitives/badge";
import { Skeleton } from "@/primitives/skeleton";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_VARIANT = {
  PENDING: "secondary",
  CONFIRMED: "default",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(dateStr)
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState({});

  const fetchOrders = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const res = await api.get("/order", { params: { page: p, size: 15 } });
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
      await api.patch("/order", null, { params: { orderId, orderStatus: status } });
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
          <table className="w-full text-sm">
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
                const currentStatus = order.status;
                const selected = pendingStatus[order.id] ?? currentStatus;
                const changed = selected !== currentStatus;
                const isUpdating = updatingId === order.id;
                const customerName =
                  order.user
                    ? `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim()
                    : order.userId ?? "—";
                const total =
                  order.total ?? order.totalAmount ?? order.totalPrice ?? 0;

                return (
                  <tr key={order.id} className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      #{order.id}
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
                );
              })}
            </tbody>
          </table>
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
