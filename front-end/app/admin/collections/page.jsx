"use client";

import { useState, useEffect, Fragment } from "react";

import Image from "next/image";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import axios from "axios";
import api, { UPLOAD_TIMEOUT } from "@/services/api";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";
import { Label } from "@/primitives/label";
import { Skeleton } from "@/primitives/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetFooter } from "@/primitives/sheet";

const EMPTY_FORM = { name: "", file: null };

export default function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [confirmId, setConfirmId] = useState(null);

  async function fetchCollections() {
    setLoading(true);
    try {
      // The 5s ceiling comes from the axios instance — no manual AbortController
      // needed here. axios reports it as a CanceledError, not an AbortError.
      const res = await api.get("/collection/all-collections");
      setCollections(res.data);
    } catch (error) {
      if (axios.isCancel(error) || error?.code === "ECONNABORTED") {
        toast.error("O servidor demorou demais para responder.");
      } else {
        toast.error("Falha ao carregar as coleções.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCollections();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(col) {
    setEditingId(col.id);
    setForm({ name: col.name ?? "", file: null });
    setFormOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("O nome é obrigatório.");
    if (!editingId && !form.file) return toast.error("A imagem é obrigatória.");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      // On edit the image is optional — the API keeps the current one when omitted.
      if (form.file) fd.append("File", form.file);

      if (editingId) {
        await api.put(`/collection/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: UPLOAD_TIMEOUT,
        });
        toast.success("Coleção atualizada.");
      } else {
        await api.post("/collection", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: UPLOAD_TIMEOUT,
        });
        toast.success("Coleção criada.");
      }

      setFormOpen(false);
      fetchCollections();
    } catch (err) {
      // 409 is the API's duplicate-name response — worth spelling out.
      toast.error(
        err?.response?.status === 409
          ? "Já existe uma coleção com esse nome."
          : "Falha ao salvar a coleção."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/collection/${id}`);
      toast.success("Coleção excluída.");
      setConfirmId(null);
      fetchCollections();
    } catch {
      toast.error("Falha ao excluir a coleção.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Coleções</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie as coleções de produtos</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={16} /> Nova Coleção
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma coleção encontrada.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Coleção</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {collections.map(col => (
                  <Fragment key={col.id}>
                    <tr className="bg-background hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {col.url ? (
                            <div className="relative h-10 w-10 rounded-md overflow-hidden border shrink-0">
                              <Image
                                src={col.url}
                                alt={col.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-muted shrink-0" />
                          )}
                          <span className="font-medium">{col.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(col)} title="Editar">
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setConfirmId(col.id)}
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {confirmId === col.id && (
                      <tr className="bg-destructive/5">
                        <td colSpan={2} className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-destructive font-medium">
                              Excluir &ldquo;{col.name}&rdquo;? Esta ação não pode ser desfeita.
                            </span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(col.id)}
                            >
                              Confirmar
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent side="right" className="sm:max-w-sm w-full">
          <SheetHeader className="border-b pb-4">
            <h2 className="font-semibold text-foreground">
              {editingId ? "Editar Coleção" : "Nova Coleção"}
            </h2>
          </SheetHeader>

          <form id="col-form" onSubmit={handleSubmit} className="p-4">
            <div className="grid gap-2">
              <Label htmlFor="col-name">Nome</Label>
              <Input
                id="col-name"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da coleção"
                required
              />
              <Label htmlFor="col-image">Imagem</Label>
              <Input
                id="col-image"
                type="file"
                accept="image/*"
                onChange={e => setForm(prev => ({
                  ...prev,
                  file: e.target.files[0] ?? null,
                }))}
                required={!editingId}
              />
              {editingId && (
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para manter a imagem atual.
                </p>
              )}
            </div>
          </form>

          <SheetFooter className="border-t">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button type="submit" form="col-form" disabled={submitting}>
              {submitting && <Loader2 size={15} className="animate-spin mr-2" />}
              {editingId ? "Salvar Alterações" : "Criar"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
