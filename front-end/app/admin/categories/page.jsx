"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import api from "@/services/api";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";
import { Label } from "@/primitives/label";
import { Skeleton } from "@/primitives/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetFooter } from "@/primitives/sheet";

const EMPTY_FORM = { name: "", file: ""};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [confirmId, setConfirmId] = useState(null);

  const [uploadingId, setUploadingId] = useState(null);
  const fileRef = useRef(null);
  const uploadTargetId = useRef(null);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await api.get("/category/all-categories");
      setCategories(res.data);
    } catch {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(cat) {
    setEditingId(cat.id);
    setForm({
       name: cat.name ?? ""
     });
    setFormOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required.");
    if (!form.file) return toast.error("Image is required.");

    setSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/category/${editingId}`, { file: form.file });
        toast.success("Category updated.");
      } else {
        await api.post("/category", { name: form.name, File: form.file });
        toast.success("Category created.");
      }
      setFormOpen(false);
      fetchCategories();
    } catch {
      toast.error("Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/category/${id}`);
      toast.success("Category deleted.");
      setConfirmId(null);
      fetchCategories();
    } catch {
      toast.error("Failed to delete category.");
    }
  }

  function triggerUpload(catId) {
    uploadTargetId.current = catId;
    fileRef.current?.click();
  }

  async function handleUploadImage(e) {
    const file = e.target.files?.[0];
    const id = uploadTargetId.current;
    if (!file || !id) return;

    const fd = new FormData();
    fd.append("image", file);
    setUploadingId(id);
    try {
      await api.patch(`/category/${id}/image`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image updated.");
      fetchCategories();
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setUploadingId(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage product categories</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={16} /> New Category
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadImage}
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories found.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map(cat => (
                <>
                  <tr key={cat.id} className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {(cat.imageUrl ?? cat.image) ? (
                          <div className="relative h-10 w-10 rounded-md overflow-hidden border shrink-0">
                            <Image
                              src={cat.imageUrl ?? cat.image}
                              alt={cat.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted shrink-0" />
                        )}
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => triggerUpload(cat.id)}
                          disabled={uploadingId === cat.id}
                          title="Upload image"
                        >
                          {uploadingId === cat.id
                            ? <Loader2 size={15} className="animate-spin" />
                            : <Upload size={15} />
                          }
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(cat)} title="Edit">
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setConfirmId(cat.id)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {confirmId === cat.id && (
                    <tr key={`confirm-${cat.id}`} className="bg-destructive/5">
                      <td colSpan={2} className="px-4 py-3">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-destructive font-medium">
                            Delete &ldquo;{cat.name}&rdquo;? This cannot be undone.
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(cat.id)}
                          >
                            Confirm
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent side="right" className="sm:max-w-sm w-full">
          <SheetHeader className="border-b pb-4">
            <h2 className="font-semibold text-foreground">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
          </SheetHeader>

          <form id="cat-form" onSubmit={handleSubmit} className="p-4">
            <div className="grid gap-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={e => setForm({ name: e.target.value })}
                placeholder="Category name"
                required
              />
              <Label htmlFor="cat-image">Imagem</Label>
              <Input
                id="cat-image"
                type="file"
                onChange={e => setForm(prev => ({
                  ...prev,
                  file: e.target.files[0],
                }))}
                required
              />
            </div>
          </form>

          <SheetFooter className="border-t">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" form="cat-form" disabled={submitting}>
              {submitting && <Loader2 size={15} className="animate-spin mr-2" />}
              {editingId ? "Save Changes" : "Create"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
