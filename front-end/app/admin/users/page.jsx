"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { toast } from "sonner";
import {
  Loader2, Search, X, ChevronRight, Trash2, MapPin, Mail, Phone,
  ShoppingBag, ShoppingCart, CalendarDays,
} from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/primitives/button";
import { Badge } from "@/primitives/badge";
import { Input } from "@/primitives/input";
import { Skeleton } from "@/primitives/skeleton";
import { Avatar, AvatarFallback } from "@/primitives/Avatar";

const ROLES = ["USER", "ADMIN"];

// Rótulos de exibição em PT-BR — os valores de enum enviados à API não mudam.
const ROLE_LABELS = { USER: "Usuário", ADMIN: "Admin" };

const ORDER_STATUS_LABELS = {
  PENDING: "Pendente",
  PAID: "Pago",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const ORDER_STATUS_VARIANT = {
  PENDING: "secondary",
  PAID: "default",
  CANCELLED: "destructive",
  REFUNDED: "outline",
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// O back-end recusa que um admin mexa no próprio papel — é o que garante que
// sempre reste ao menos um ADMIN.
const SELF_ROLE_HINT = "Você não pode alterar o papel da própria conta.";

// Intervalo entre a última tecla e a chamada à API, para não disparar uma
// requisição por caractere digitado na busca.
const SEARCH_DEBOUNCE_MS = 300;

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value)
  );
}

function formatCep(cep) {
  if (!cep) return "—";
  const digits = String(cep).replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : cep;
}

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm break-words">{children ?? "—"}</dd>
    </div>
  );
}

export default function AdminUsers() {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingRole, setPendingRole] = useState({});

  // Ficha completa: carregada sob demanda ao expandir a linha e mantida em
  // cache para que fechar e reabrir não faça outra requisição.
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({});
  const [detailLoadingId, setDetailLoadingId] = useState(null);

  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = useCallback(async (email) => {
    setLoading(true);
    try {
      const res = await api.get("/users", { params: { email: email ?? "" } });
      setUsers(res.data.content ?? res.data);
    } catch {
      toast.error("Falha ao carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(search), search ? SEARCH_DEBOUNCE_MS : 0);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const loadDetail = useCallback(async (userId) => {
    setDetailLoadingId(userId);
    try {
      const res = await api.get(`/users/${userId}`);
      setDetails(prev => ({ ...prev, [userId]: res.data }));
      return res.data;
    } catch {
      toast.error("Falha ao carregar os dados do usuário.");
      return null;
    } finally {
      setDetailLoadingId(null);
    }
  }, []);

  async function toggleDetail(userId) {
    if (expandedId === userId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(userId);
    setConfirmId(null);

    if (details[userId]) return;

    const detail = await loadDetail(userId);
    // Se a requisição falhou não há o que mostrar — recolhe a linha de volta.
    if (!detail) setExpandedId(prev => (prev === userId ? null : prev));
  }

  async function handleUpdateRole(userId) {
    const role = pendingRole[userId];
    if (!role) return;
    setUpdatingId(userId);
    try {
      const res = await api.put(`/users/${userId}/role`, { role });
      // Reflete o papel que o servidor gravou, não o que foi enviado.
      const saved = res.data?.role ?? role;
      toast.success("Papel atualizado.");
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: saved } : u))
      );
      setDetails(prev =>
        prev[userId] ? { ...prev, [userId]: { ...prev[userId], role: saved } } : prev
      );
      setPendingRole(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Falha ao atualizar o papel.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(userId) {
    setDeletingId(userId);
    try {
      await api.delete(`/users/${userId}`);
      toast.success("Usuário excluído.");
      setUsers(prev => prev.filter(u => u.id !== userId));
      setDetails(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      setExpandedId(null);
      setConfirmId(null);
    } catch (err) {
      // O back-end recusa (409) quando surgiu carrinho ou pedido desde que a
      // ficha foi carregada; recarrega para o painel refletir o estado real.
      toast.error(err?.response?.data?.message ?? "Falha ao excluir o usuário.");
      setConfirmId(null);
      if (err?.response?.status === 409) loadDetail(userId);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie contas e papéis de usuários</p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por e-mail…"
          aria-label="Buscar usuário por e-mail"
          className="pl-8 pr-8"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Limpar busca"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {search
            ? `Nenhum usuário com e-mail contendo "${search}".`
            : "Nenhum usuário encontrado."}
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Usuário</th>
                <th className="text-left px-4 py-3 font-medium">E-mail</th>
                <th className="text-left px-4 py-3 font-medium">Papel</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(user => {
                const initials =
                  `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?";
                const currentRole = user.role ?? "USER";
                const selected = pendingRole[user.id] ?? currentRole;
                const changed = selected !== currentRole;
                const isUpdating = updatingId === user.id;
                const fullName =
                  [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";

                const isExpanded = expandedId === user.id;
                const detail = details[user.id];
                const isDetailLoading = detailLoadingId === user.id;
                const isSelf = currentAdmin?.id === user.id;
                const isDeleting = deletingId === user.id;

                return (
                  <Fragment key={user.id}>
                  <tr className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleDetail(user.id)}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Ocultar dados do usuário" : "Ver todos os dados"}
                        className="flex items-center gap-3 text-left transition-colors hover:text-foreground"
                      >
                        <ChevronRight
                          className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                        <Avatar>
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{fullName}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={currentRole === "ADMIN" ? "default" : "secondary"}>
                        {ROLE_LABELS[currentRole] ?? currentRole}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={selected}
                          onChange={e =>
                            setPendingRole(prev => ({ ...prev, [user.id]: e.target.value }))
                          }
                          className="h-8 rounded-md border bg-background px-2 text-sm
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                            disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isUpdating || isSelf}
                          aria-label={`Papel de ${fullName}`}
                          title={isSelf ? SELF_ROLE_HINT : undefined}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          disabled={!changed || isUpdating || isSelf}
                          title={isSelf ? SELF_ROLE_HINT : undefined}
                          onClick={() => handleUpdateRole(user.id)}
                        >
                          {isUpdating
                            ? <Loader2 size={14} className="animate-spin" />
                            : "Salvar"
                          }
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-muted/20">
                      <td colSpan={4} className="px-4 py-5">
                        {isDetailLoading || !detail ? (
                          <div className="space-y-3">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-72" />
                            <Skeleton className="h-4 w-40" />
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-3">
                              {/* Perfil */}
                              <div>
                                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Perfil
                                </h4>
                                <dl className="space-y-2.5">
                                  <Field label="ID">#{detail.id}</Field>
                                  <Field label="Nome">
                                    {[detail.firstName, detail.lastName].filter(Boolean).join(" ") || null}
                                  </Field>
                                  <Field label="E-mail">
                                    <span className="inline-flex items-center gap-1.5">
                                      <Mail size={13} className="text-muted-foreground" />
                                      {detail.email}
                                    </span>
                                  </Field>
                                  <Field label="Papel">
                                    <Badge variant={detail.role === "ADMIN" ? "default" : "secondary"}>
                                      {ROLE_LABELS[detail.role] ?? detail.role}
                                    </Badge>
                                  </Field>
                                  <Field label="Cadastrado em">
                                    <span className="inline-flex items-center gap-1.5">
                                      <CalendarDays size={13} className="text-muted-foreground" />
                                      {formatDate(detail.createdAt)}
                                    </span>
                                  </Field>
                                </dl>
                              </div>

                              {/* Endereço */}
                              <div>
                                <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  <MapPin size={14} /> Endereço
                                </h4>
                                {detail.address ? (
                                  <address className="text-sm not-italic leading-relaxed">
                                    <div>
                                      {detail.address.street}
                                      {detail.address.number ? `, ${detail.address.number}` : ""}
                                    </div>
                                    {detail.address.bairro && <div>{detail.address.bairro}</div>}
                                    <div>{detail.address.city}</div>
                                    <div>CEP {formatCep(detail.address.cep)}</div>
                                    {detail.address.phone && (
                                      <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                                        <Phone size={13} /> {detail.address.phone}
                                      </div>
                                    )}
                                  </address>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Nenhum endereço cadastrado.
                                  </p>
                                )}
                              </div>

                              {/* Atividade */}
                              <div>
                                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Atividade
                                </h4>
                                <dl className="space-y-2.5">
                                  <Field label="Carrinhos">
                                    <span className="inline-flex items-center gap-1.5">
                                      <ShoppingCart size={13} className="text-muted-foreground" />
                                      <span className="tabular-nums">{detail.cartCount}</span>
                                    </span>
                                  </Field>
                                  <Field label="Pedidos">
                                    <span className="inline-flex items-center gap-1.5">
                                      <ShoppingBag size={13} className="text-muted-foreground" />
                                      <span className="tabular-nums">{detail.orderCount}</span>
                                    </span>
                                  </Field>
                                </dl>
                              </div>
                            </div>

                            {/* Histórico de pedidos */}
                            {detail.orders?.length > 0 && (
                              <div>
                                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  <ShoppingBag size={14} /> Pedidos
                                </h4>
                                <ul className="space-y-1.5 text-sm">
                                  {detail.orders.map(order => (
                                    <li
                                      key={order.id}
                                      className="flex flex-wrap items-center gap-x-3 gap-y-1"
                                    >
                                      <span className="font-medium text-muted-foreground">
                                        #{order.id}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {formatDate(order.createdAt)}
                                      </span>
                                      <span className="tabular-nums">
                                        {BRL.format(order.total ?? 0)}
                                      </span>
                                      <Badge variant={ORDER_STATUS_VARIANT[order.status] ?? "secondary"}>
                                        {ORDER_STATUS_LABELS[order.status] ?? order.status ?? "—"}
                                      </Badge>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Exclusão — só liberada para conta sem histórico. */}
                            <div className="border-t pt-4">
                              {confirmId === user.id ? (
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <span className="font-medium text-destructive">
                                    Excluir {detail.email}? Esta ação não pode ser desfeita.
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={isDeleting}
                                    onClick={() => handleDelete(user.id)}
                                  >
                                    {isDeleting
                                      ? <Loader2 size={14} className="animate-spin" />
                                      : "Confirmar"
                                    }
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={isDeleting}
                                    onClick={() => setConfirmId(null)}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-wrap items-center gap-3">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="gap-1.5"
                                    disabled={!detail.deletable || isSelf}
                                    onClick={() => setConfirmId(user.id)}
                                  >
                                    <Trash2 size={14} /> Excluir usuário
                                  </Button>
                                  {isSelf ? (
                                    <span className="text-sm text-muted-foreground">
                                      Você não pode apagar a própria conta pelo painel.
                                    </span>
                                  ) : !detail.deletable && (
                                    <span className="text-sm text-muted-foreground">
                                      Tem {detail.cartCount} carrinho(s) e {detail.orderCount} pedido(s)
                                      atrelados — só é possível excluir contas sem histórico.
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
    </div>
  );
}
