"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import api from "@/services/api";
import { Button } from "@/primitives/button";
import { Badge } from "@/primitives/badge";
import { Skeleton } from "@/primitives/skeleton";
import { Avatar, AvatarFallback } from "@/primitives/Avatar";

const ROLES = ["USER", "ADMIN"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingRole, setPendingRole] = useState({});

  useEffect(() => {
    api.get("/users")
      .then(res => setUsers(res.data.content ?? res.data))
      .catch(() => toast.error("Failed to load users."))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpdateRole(userId) {
    const role = pendingRole[userId];
    if (!role) return;
    setUpdatingId(userId);
    try {
      await api.put(`/users/${userId}/role`, { role });
      toast.success("Role updated.");
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role } : u))
      );
      setPendingRole(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } catch {
      toast.error("Failed to update role.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage user accounts and roles</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
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

                return (
                  <tr key={user.id} className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={currentRole === "ADMIN" ? "default" : "secondary"}>
                        {currentRole}
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
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          disabled={isUpdating}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          disabled={!changed || isUpdating}
                          onClick={() => handleUpdateRole(user.id)}
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
    </div>
  );
}
