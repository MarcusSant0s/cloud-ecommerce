"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Images, Star, Upload, ChevronLeft, ChevronRight, Loader2, Search, X,
} from "lucide-react";
import api from "@/services/api";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";
import { Label } from "@/primitives/label";
import { Badge } from "@/primitives/badge";
import { Skeleton } from "@/primitives/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetFooter } from "@/primitives/sheet";

const EMPTY_FORM = {
  name: "",
  description: "",
  priceOriginal: "",
  priceDiscount: "",
  quantity: "",
  categoryIds: [],
  files: [],
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const EMPTY_ERRORS = { name: false, priceOriginal: false, priceDiscount: false, quantity: false, files: false };

function validateForm(form, editingId) {
  const errs = {};
  if (!form.name.trim()) errs.name = true;
  const price = parseFloat(form.priceOriginal);
  if (form.priceOriginal === "" || isNaN(price) || price < 0) errs.priceOriginal = true;
  if (form.priceDiscount !== "" && form.priceDiscount !== null) {
    const disc = parseFloat(form.priceDiscount);
    if (isNaN(disc) || disc < 0 || disc > 1) errs.priceDiscount = true;
  }
  const qty = parseInt(form.quantity, 10);
  if (form.quantity === "" || isNaN(qty) || qty < 0) errs.quantity = true;
  if (!editingId && form.files.length === 0) errs.files = true;
  return errs;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [imgOpen, setImgOpen] = useState(false);
  const [imgProduct, setImgProduct] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);

  const [confirmId, setConfirmId] = useState(null);

  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [shaking, setShaking] = useState({});

  function triggerShake(fields) {
    const s = {};
    fields.forEach(f => { s[f] = true; });
    setShaking(s);
    setTimeout(() => setShaking({}), 450);
  }

  function clearError(field) {
    setErrors(prev => ({ ...prev, [field]: false }));
  }

  const fetchProducts = useCallback(async (p, name, categoryId) => {
    setLoading(true);
    try {
      const res = await api.get("/product", {
        params: { page: p, size: 10, name: name ?? "", categoryId: categoryId ?? "" },
      });
      setProducts(res.data.content ?? res.data);
      setTotalPages(res.data.totalPages ?? 1);
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

   const fetchEditProduct = async (product_id) => {
    setLoading(true);
    try {
      const res = await api.get(`/product/${product_id}`);
      return res.data;
    } catch {
      toast.error("Failed to load product.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts(page, search, filterCategory);
  }, [page, search, filterCategory, fetchProducts]);

  useEffect(() => {
    api.get("/category/all-categories")
      .then(res => setCategories(res.data))
      .catch(() => {});
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors(EMPTY_ERRORS);
    setFormOpen(true);
  }

  async function openEdit(product_id) {
    setEditingId(product_id);
    let product = await fetchEditProduct(product_id);
    console.log(product)

    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      priceOriginal: product.priceOriginal ?? "",
      priceDiscount: product.priceDiscount ?? "",
      quantity: product.quantity ?? "",
      categoryIds: (product.categories ?? []).map(c => c.id),
      files: [],
    });
    setErrors(EMPTY_ERRORS);
    setFormOpen(true);
  }

  async function uploadFiles(productId, files) {
    for (const file of files) {
      const fd = new FormData();
      fd.append("File", file);
      await api.post(`/product/${productId}/images`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateForm(form, editingId);
    if (Object.keys(errs).length > 0) {
      setErrors(prev => ({ ...prev, ...errs }));
      triggerShake(Object.keys(errs));
      return;
    }
    setSubmitting(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        priceOriginal: parseFloat(form.priceOriginal),
        priceDiscount: form.priceDiscount ? parseFloat(form.priceDiscount) : null,
        quantity: parseInt(form.quantity, 10),
        categoryIds: Array.from(form.categoryIds),
      };

      if (editingId) {

        const formData = new FormData();

        formData.append("name", payload.name);
        formData.append("description", payload.description);
        formData.append("priceOriginal", payload.priceOriginal);
        formData.append("priceDiscount", payload.priceDiscount);
        formData.append("quantity", payload.quantity);
        formData.append("categoryIds", 
            JSON.stringify(form.categoryIds)
        );
      


        form.files.forEach(file => {
          formData.append("files", file);
        });
        console.log(formData)


        await api.put(`/product/${editingId}`, formData);
        if (form.files.length > 0) await uploadFiles(editingId, form.files);
        toast.success("Product updated.");
      } else {
        const res = await api.post("/product", payload);
        await uploadFiles(res.data.id, form.files);
        toast.success("Product created.");
      }

      setFormOpen(false);
      fetchProducts(page, search, filterCategory);
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
      fetchProducts(page, search, filterCategory);
    } catch {
      toast.error("Failed to delete product.");
    }
  }

  async function fetchImages(productId) {
    setImgLoading(true);
    try {
      const res = await api.get(`product/product-images/${productId}`);
      setImgProduct(prev => ({ ...prev, images: Array.from(res.data) }));
    } catch {
      toast.error("Failed to load images.");
    } finally {
      setImgLoading(false);
    }
  }

  async function openImages(product) {
    setImgProduct(product);
    setImgOpen(true);
    await fetchImages(product.id);
  }

  async function handleDeleteImage(imageId) {
    try {
      await api.delete(`/images/${imageId}`);
      toast.success("Image deleted.");
      await fetchImages(imgProduct.id);
      fetchProducts(page, search, filterCategory);
    } catch {
      toast.error("Failed to delete image.");
    }
  }

  async function handleSetMain(imageId) {
    try {
      await api.patch(`/images/${imageId}/set-main`);
      toast.success("Main image updated.");
      await fetchImages(imgProduct.id);
      fetchProducts(page, search, filterCategory);
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
      <style>{`
        @keyframes field-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
        .shake { animation: field-shake 0.4s ease-in-out; }
      `}</style>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your product catalog</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={16} /> New Product
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by name…"
            className="pl-8 pr-8"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(0); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={filterCategory}
          onChange={e => { setFilterCategory(e.target.value); setPage(0); }}
          className="h-9 rounded-md border bg-transparent px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="">All categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
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
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(product => (
                <Fragment key={product.id}>
                  <tr className="bg-background hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.mainImageUrl ? (
                          <div className="relative h-10 w-10 rounded-md overflow-hidden border shrink-0">
                            <Image
                              src={product.mainImageUrl}
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
                      {BRL.format(product.priceOriginal ?? product.finalPrice ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.quantity > 0 ? "secondary" : "destructive"}>
                        {product.quantity ?? 0}
                      </Badge>
                    </td> 
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openImages(product)} title="Manage images">
                          <Images size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(product.id)} title="Edit">
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
                    <tr className="bg-destructive/5">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-destructive font-medium">
                            Delete &ldquo;{product.name}&rdquo;? This cannot be undone.
                          </span>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                            Confirm
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                            Cancel
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
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-3 mt-4 text-sm text-muted-foreground">
          <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={16} />
          </Button>
          <span>Page {page + 1} / {totalPages}</span>
          <Button variant="outline" size="icon" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
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
              <Label htmlFor="p-name">Name <span className="text-destructive">*</span></Label>
              <div className={shaking.name ? "shake" : ""}>
                <Input
                  id="p-name"
                  value={form.name}
                  onChange={e => {
                    setForm(prev => ({ ...prev, name: e.target.value }));
                    if (e.target.value.trim()) clearError("name");
                  }}
                  className={errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}
                  placeholder="Product name"
                />
              </div>
              {errors.name && <p className="text-xs text-destructive">Name is required.</p>}
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
                <Label htmlFor="p-price">Price (R$) <span className="text-destructive">*</span></Label>
                <div className={shaking.priceOriginal ? "shake" : ""}>
                  <Input
                    id="p-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.priceOriginal}
                    onChange={e => {
                      setForm(prev => ({ ...prev, priceOriginal: e.target.value }));
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v >= 0) clearError("priceOriginal");
                    }}
                    className={errors.priceOriginal ? "border-destructive focus-visible:ring-destructive/30" : ""}
                    placeholder="0.00"
                  />
                </div>
                {errors.priceOriginal && <p className="text-xs text-destructive">Valid price required.</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="p-discount">Discount (0.10 = 10%)</Label>
                <div className={shaking.priceDiscount ? "shake" : ""}>
                  <Input
                    id="p-discount"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={form.priceDiscount}
                    onChange={e => {
                      setForm(prev => ({ ...prev, priceDiscount: e.target.value }));
                      const v = parseFloat(e.target.value);
                      if (e.target.value === "" || (!isNaN(v) && v >= 0 && v <= 1)) clearError("priceDiscount");
                    }}
                    onBlur={e => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) setForm(prev => ({ ...prev, priceDiscount: v.toFixed(2) }));
                    }}
                    className={errors.priceDiscount ? "border-destructive focus-visible:ring-destructive/30" : ""}
                    placeholder="0.00"
                  />
                </div>
                {errors.priceDiscount && <p className="text-xs text-destructive">Must be between 0.00 and 1.00.</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="p-qty">Stock <span className="text-destructive">*</span></Label>
                <div className={shaking.quantity ? "shake" : ""}>
                  <Input
                    id="p-qty"
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={e => {
                      setForm(prev => ({ ...prev, quantity: e.target.value }));
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v >= 0) clearError("quantity");
                    }}
                    className={errors.quantity ? "border-destructive focus-visible:ring-destructive/30" : ""}
                    placeholder="0"
                  />
                </div>
                {errors.quantity && <p className="text-xs text-destructive">Valid stock quantity required.</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>
                Images {!editingId && <span className="text-destructive">*</span>}
                {editingId && <span className="text-muted-foreground font-normal"> (optional — adds to existing)</span>}
              </Label>
              <div className={shaking.files ? "shake" : ""}>
                <label
                  className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-5 cursor-pointer
                    text-muted-foreground text-sm hover:bg-accent/50 transition-colors
                    ${errors.files ? "border-destructive text-destructive" : ""}`}
                >
                  <Upload size={20} />
                  <span>Click to select images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={e => {
                      const picked = Array.from(e.target.files ?? []);
                      setForm(prev => ({ ...prev, files: [...prev.files, ...picked] }));
                      if (picked.length > 0) clearError("files");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {errors.files && <p className="text-xs text-destructive">At least one image is required.</p>}
              {form.files.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {form.files.map((file, i) => (
                    <div key={i} className="relative rounded-md overflow-hidden border aspect-square group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="object-cover w-full h-full"
                      />
                      {i === 0 && (
                        <div className="absolute top-1 left-1">
                          <Badge className="text-xs px-1.5 py-0.5 gap-1">
                            <Star size={9} fill="currentColor" /> Main
                          </Badge>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, files: prev.files.filter((_, j) => j !== i) }))}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
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
              Delete or set the main image for this product.
            </p>
          </SheetHeader>

          <div className="p-4 flex flex-col gap-4">
            {imgLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : (imgProduct?.images ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No images yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {(imgProduct?.images ?? []).map(img => {
                  const src = img.url ?? img.imageUrl;
                  console.log(imgProduct)
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
