"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Images, Star, Upload, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import api from "@/services/api";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";
import { Label } from "@/primitives/label";
import { Badge } from "@/primitives/badge";
import { Skeleton } from "@/primitives/skeleton";
import { Separator } from "@/primitives/separator";
import {
  Sheet, SheetContent, SheetHeader, SheetFooter,
} from "@/primitives/sheet";

const EMPTY_FORM = { name: "", description: "", price: "", quantity: "", categoryIds: [] };

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [imgOpen, setImgOpen] = useState(false);
  const [imgProduct, setImgProduct] = useState(null);
  const [imgUploading, setImgUploading] = useState(false);
  const fileRef = useRef(null);

  const [confirmId, setConfirmId] = useState(null);

  const fetchProducts = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await api.get("/product", { params: { page: p, size: 10 } });
      setProducts(res.data.content ?? res.data);
      setTotalPages(res.data.totalPages ?? 1);
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  useEffect(() => {
    api.get("/category/all-categories")
      .then(res => setCategories(res.data))
      .catch(() => {});
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price ?? product.finalPrice ?? "",
      quantity: product.quantity ?? "",
      categoryIds: (product.categories ?? []).map(c => c.id),
    });
    setFormOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required.");
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
        categoryIds: form.categoryIds,
      };
      if (editingId) {
        await api.put(`/product/${editingId}`, payload);
        toast.success("Product updated.");
      } else {
        await api.post("/product", payload);
        toast.success("Product created.");
      }
      setFormOpen(false);
      fetchProducts(page);
    } catch {
      toast.error("Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/product/${id}`);
      toast.success("Product deleted.");
      setConfirmId(null);
      fetchProducts(page);
    } catch {
      toast.error("Failed to delete product.");
    }
  }

  function openImages(product) {
    setImgProduct(product);
    setImgOpen(true);
  }

  async function handleUploadImage(e) {
    const file = e.target.files?.[0];
    if (!file || !imgProduct) return;
    const fd = new FormData();
    fd.append("image", file);
    setImgUploading(true);
    try {
      const res = await api.post(`/product/${imgProduct.id}/images`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image uploaded.");
      setImgProduct(prev => ({
        ...prev,
        images: [...(prev.images ?? []), res.data],
      }));
      fetchProducts(page);
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setImgUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDeleteImage(imageId) {
    try {
      await api.delete(`/images/${imageId}`);
      toast.success("Image deleted.");
      setImgProduct(prev => ({
        ...prev,
        images: (prev.images ?? []).filter(img => img.id !== imageId),
      }));
      fetchProducts(page);
    } catch {
      toast.error("Failed to delete image.");
    }
  }

  async function handleSetMain(imageId) {
    try {
      await api.patch(`/images/${imageId}/set-main`);
      toast.success("Main image updated.");
      setImgProduct(prev => ({
        ...prev,
        images: (prev.images ?? []).map(img => ({ ...img, isMain: img.id === imageId })),
      }));
      fetchProducts(page);
    } catch {
      toast.error("Failed to set main image.");
    }
  }

  function toggleCategory(id) {
    setForm(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter(c => c !== id)
        : [...prev.categoryIds, id],
    }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your product catalog</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={16} /> New Product
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products found.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Stock</th>
                <th className="text-left px-4 py-3 font-medium">Categories</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(product => (
                <>
                  <tr key={product.id} className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {(product.images?.[0]?.url ?? product.images?.[0]?.imageUrl) ? (
                          <div className="relative h-10 w-10 rounded-md overflow-hidden border shrink-0">
                            <Image
                              src={product.images[0].url ?? product.images[0].imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted shrink-0" />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {BRL.format(product.price ?? product.finalPrice ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.quantity > 0 ? "secondary" : "destructive"}>
                        {product.quantity ?? 0}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(product.categories ?? []).map(c => c.name).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openImages(product)} title="Manage images">
                          <Images size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)} title="Edit">
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setConfirmId(product.id)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {confirmId === product.id && (
                    <tr key={`confirm-${product.id}`} className="bg-destructive/5">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-destructive font-medium">
                            Delete &ldquo;{product.name}&rdquo;? This cannot be undone.
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
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

      {/* Create / Edit Sheet */}
      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <h2 className="font-semibold text-foreground">
              {editingId ? "Edit Product" : "New Product"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editingId ? "Update the product details below." : "Fill in the details to create a new product."}
            </p>
          </SheetHeader>

          <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
            <div className="grid gap-2">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Product name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="p-desc">Description</Label>
              <textarea
                id="p-desc"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Product description"
                rows={3}
                className="flex w-full rounded-md border bg-transparent px-3 py-2 text-sm
                  placeholder:text-muted-foreground focus-visible:outline-none
                  focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="p-price">Price (R$)</Label>
                <Input
                  id="p-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-qty">Stock</Label>
                <Input
                  id="p-qty"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={e => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {categories.length > 0 && (
              <div className="grid gap-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <label
                      key={cat.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm cursor-pointer transition-colors select-none
                        ${form.categoryIds.includes(cat.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-accent"
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={form.categoryIds.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </form>

          <SheetFooter className="border-t">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="product-form" disabled={submitting}>
              {submitting && <Loader2 size={15} className="animate-spin mr-2" />}
              {editingId ? "Save Changes" : "Create Product"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Image Management Sheet */}
      <Sheet open={imgOpen} onOpenChange={setImgOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <h2 className="font-semibold text-foreground">
              Images — {imgProduct?.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Upload, delete, or set the main image for this product.
            </p>
          </SheetHeader>

          <div className="p-4 flex flex-col gap-4">
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadImage}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={imgUploading}
                onClick={() => fileRef.current?.click()}
              >
                {imgUploading
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Upload size={15} />
                }
                Upload Image
              </Button>
            </div>

            <Separator />

            {(imgProduct?.images ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No images yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {(imgProduct?.images ?? []).map(img => {
                  const src = img.url ?? img.imageUrl;
                  return (
                    <div key={img.id} className="relative border rounded-lg overflow-hidden group">
                      <div className="relative aspect-square">
                        {src ? (
                          <Image src={src} alt="product image" fill className="object-cover" />
                        ) : (
                          <div className="h-full bg-muted" />
                        )}
                      </div>
                      {img.isMain && (
                        <div className="absolute top-2 left-2">
                          <Badge className="gap-1 text-xs">
                            <Star size={10} fill="currentColor" /> Main
                          </Badge>
                        </div>
                      )}
                      <div className="flex gap-2 p-2 bg-muted/50">
                        {!img.isMain && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs gap-1"
                            onClick={() => handleSetMain(img.id)}
                          >
                            <Star size={12} /> Set main
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 text-xs gap-1"
                          onClick={() => handleDeleteImage(img.id)}
                        >
                          <Trash2 size={12} /> Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
