"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Star, Upload, ChevronLeft, ChevronRight, Loader2, Search, X, Check,
} from "lucide-react";
import api from "@/services/api";
import { compressImage } from "@/lib/compress-image";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";
import { Label } from "@/primitives/label";
import { Badge } from "@/primitives/badge";
import { Skeleton } from "@/primitives/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetFooter } from "@/primitives/sheet";

// Image constraints for the product form.
const MIN_IMAGES = 1;
const MAX_IMAGES = 6;
const MAX_FILE_SIZE_MB = 5;

const EMPTY_FORM = {
  name: "",
  description: "",
  priceOriginal: "",
  priceDiscount: "0", // default: no discount
  quantity: "",
  categoryIds: [],
  collectionIds: [],
  files: [],
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const EMPTY_ERRORS = { name: false, priceOriginal: false, priceDiscount: false, quantity: false, files: false };

function validateForm(form, editingId, existingCount = 0) {
  const errs = {};
  if (!form.name.trim()) errs.name = true;
  const price = parseFloat(form.priceOriginal);
  if (form.priceOriginal === "" || isNaN(price) || price < 0) errs.priceOriginal = true;
  if (form.priceDiscount !== "" && form.priceDiscount !== null) {
    const disc = parseFloat(form.priceDiscount); // percent, 0–100
    if (isNaN(disc) || disc < 0 || disc > 100) errs.priceDiscount = true;
  }
  const qty = parseInt(form.quantity, 10);
  if (form.quantity === "" || isNaN(qty) || qty < 0) errs.quantity = true;
  // Already-saved images count towards both limits when editing.
  const total = existingCount + form.files.length;
  if (total < MIN_IMAGES) errs.files = true;
  if (total > MAX_IMAGES) errs.files = true;
  return errs;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  // Images already persisted for the product being edited (empty while creating).
  const [existingImages, setExistingImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  const [confirmId, setConfirmId] = useState(null);

  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [shaking, setShaking] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState([]);

  function addFiles(fileList) {
    const incoming = Array.from(fileList ?? []);
    if (incoming.length === 0) return;

    // Reject non-images.
    const images = incoming.filter(f => f.type.startsWith("image/"));
    if (images.length < incoming.length) toast.error("Apenas arquivos de imagem são permitidos.");

    // Reject oversized files.
    const sized = images.filter(f => {
      const ok = f.size <= MAX_FILE_SIZE_MB * 1024 * 1024;
      if (!ok) toast.error(`"${f.name}" excede ${MAX_FILE_SIZE_MB}MB.`);
      return ok;
    });
    if (sized.length === 0) return;

    // Enforce the max count across saved + pending images.
    const room = MAX_IMAGES - existingImages.length - form.files.length;
    if (room <= 0) {
      toast.error(`Máximo de ${MAX_IMAGES} imagens atingido.`);
      return;
    }
    const accepted = sized.slice(0, room);
    if (accepted.length < sized.length) {
      toast.warning(`Só cabem mais ${room} — ${sized.length - accepted.length} imagem(ns) ignorada(s).`);
    }

    setForm(prev => ({ ...prev, files: [...prev.files, ...accepted] }));
    clearError("files");
  }

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
    api.get("/collection/all-collections")
      .then(res => setCollections(res.data))
      .catch(() => {});
  }, []);

  // Build object-URL previews for pending files once per file-list change,
  // and revoke them on change/unmount so blobs don't leak.
  useEffect(() => {
    const urls = form.files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [form.files]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setExistingImages([]);
    setErrors(EMPTY_ERRORS);
    setFormOpen(true);
  }

  async function openEdit(product_id) {
    setEditingId(product_id);
    setExistingImages([]);
    fetchImages(product_id);
    const product = await fetchEditProduct(product_id);

    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      priceOriginal: product.priceOriginal ?? "",
      // API stores the discount as a fraction (0.10); the form edits it as a percent (10).
      priceDiscount: product.priceDiscount != null ? String(Math.round(product.priceDiscount * 10000) / 100) : "0",
      quantity: product.quantity ?? "",
      categoryIds: (product.categories ?? []).map(c => c.id),
      collectionIds: (product.collections ?? []).map(c => c.id),
      files: [],
    });
    setErrors(EMPTY_ERRORS);
    setFormOpen(true);
  }

  // Feeds the <progress> in the footer. Uploads are the slow part of a save, so the
  // admin sees bytes moving instead of a spinner that could mean anything.
  function trackUpload(e) {
    if (!e.total) return;
    setUploadPct(Math.round((e.loaded * 100) / e.total));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateForm(form, editingId, existingImages.length);
    if (Object.keys(errs).length > 0) {
      setErrors(prev => ({ ...prev, ...errs }));
      triggerShake(Object.keys(errs));
      toast.error("Revise os campos destacados.");
      return;
    }
    setSubmitting(true);
    setUploadPct(0);

    // The form edits the discount as a percent (10 = 10% off); the API stores it as a
    // fraction (0.10). Convert here. "No discount" is modelled as an absent value, not 0 —
    // the entity requires a discount >= 0.01 — so a zero/blank discount is simply not sent,
    // and the edit path clears any existing discount by omitting it.
    const discountPercent = parseFloat(form.priceDiscount);
    const hasRealDiscount = !isNaN(discountPercent) && discountPercent > 0;
    const discountFraction = hasRealDiscount ? discountPercent / 100 : 0;

    try {
      // Downscale/re-encode in the browser so we upload far fewer bytes and the origin
      // stores reasonably-sized assets. compressImage returns the original on any failure.
      const compressedFiles = await Promise.all(form.files.map(f => compressImage(f)));

      if (editingId) {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("priceOriginal", parseFloat(form.priceOriginal));
        if (hasRealDiscount) formData.append("priceDiscount", discountFraction);
        formData.append("quantity", parseInt(form.quantity, 10));
        // The update endpoint parses these two as JSON strings.
        formData.append("categoryIds", JSON.stringify(form.categoryIds));
        formData.append("collectionIds", JSON.stringify(form.collectionIds));

        await api.put(`/product/${editingId}`, formData);

        // New images go up as one batch rather than one request per file.
        if (compressedFiles.length > 0) {
          const images = new FormData();
          compressedFiles.forEach(file => images.append("File", file));
          await api.post(`/product/${editingId}/images`, images, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: trackUpload,
          });
        }
        toast.success("Product updated.");
      } else {
        // Product and images in a single request — the API creates them in one
        // transaction, so a failed upload can't leave a half-created product behind.
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("priceOriginal", parseFloat(form.priceOriginal));
        if (hasRealDiscount) formData.append("priceDiscount", discountFraction);
        formData.append("quantity", parseInt(form.quantity, 10));
        form.categoryIds.forEach(id => formData.append("categoryIds", id));
        form.collectionIds.forEach(id => formData.append("collectionIds", id));
        compressedFiles.forEach(file => formData.append("files", file));

        await api.post("/product", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: trackUpload,
        });
        toast.success("Product created.");
      }

      setFormOpen(false);
      fetchProducts(page, search, filterCategory);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to save product.");
    } finally {
      setSubmitting(false);
      setUploadPct(0);
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
    setImagesLoading(true);
    try {
      const res = await api.get(`/product/product-images/${productId}`);
      setExistingImages(Array.from(res.data));
    } catch {
      toast.error("Failed to load images.");
    } finally {
      setImagesLoading(false);
    }
  }

  // Saved images are deleted straight away rather than on submit — they are already
  // persisted, so there is nothing to stage.
  async function handleDeleteImage(imageId) {
    if (existingImages.length + form.files.length <= MIN_IMAGES) {
      toast.error(`O produto precisa de pelo menos ${MIN_IMAGES} imagem.`);
      return;
    }
    try {
      await api.delete(`/images/${imageId}`);
      toast.success("Image deleted.");
      await fetchImages(editingId);
      fetchProducts(page, search, filterCategory);
    } catch {
      toast.error("Failed to delete image.");
    }
  }

  async function handleSetMain(imageId) {
    try {
      await api.patch(`/images/${imageId}/set-main`);
      toast.success("Main image updated.");
      await fetchImages(editingId);
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

  // The API makes the first file the main image, so "set main" is a reorder.
  function makePendingMain(index) {
    setForm(prev => {
      const files = [...prev.files];
      const [chosen] = files.splice(index, 1);
      return { ...prev, files: [chosen, ...files] };
    });
  }

  function toggleCollection(id) {
    setForm(prev => ({
      ...prev,
      collectionIds: prev.collectionIds.includes(id)
        ? prev.collectionIds.filter(c => c !== id)
        : [...prev.collectionIds, id],
    }));
  }

  const totalImages = existingImages.length + form.files.length;

  const priceNum = parseFloat(form.priceOriginal);
  const discPercent = parseFloat(form.priceDiscount); // 0–100
  const hasPrice = !isNaN(priceNum) && priceNum >= 0;
  const hasDiscount = !isNaN(discPercent) && discPercent > 0 && discPercent <= 100;
  const finalPrice = hasPrice ? (hasDiscount ? priceNum * (1 - discPercent / 100) : priceNum) : null;

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
          <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
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
                              sizes="40px"
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
                        <div className="flex flex-wrap items-center gap-3 text-sm">
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

          <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-7 p-4">

            {/* ── Details ─────────────────────────────────────────── */}
            <section className="grid gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Details</h3>

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
            </section>

            {/* ── Pricing & stock ─────────────────────────────────── */}
            <section className="grid gap-4 border-t pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pricing &amp; stock</h3>

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
                  <Label htmlFor="p-discount">Discount (%)</Label>
                  <div className={`relative ${shaking.priceDiscount ? "shake" : ""}`}>
                    <Input
                      id="p-discount"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={form.priceDiscount}
                      onChange={e => {
                        setForm(prev => ({ ...prev, priceDiscount: e.target.value }));
                        const v = parseFloat(e.target.value);
                        if (e.target.value === "" || (!isNaN(v) && v >= 0 && v <= 100)) clearError("priceDiscount");
                      }}
                      onBlur={e => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) setForm(prev => ({ ...prev, priceDiscount: String(v) }));
                      }}
                      className={`pr-8 ${errors.priceDiscount ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                      placeholder="0"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                  {errors.priceDiscount
                    ? <p className="text-xs text-destructive">Must be between 0 and 100.</p>
                    : <p className="text-xs text-muted-foreground">Percent off — enter 10 for 10% off.</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 items-start sm:grid-cols-2">
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

                {/* Live final-price preview */}
                <div className="grid gap-2">
                  <Label>Customer pays</Label>
                  <div className="flex h-9 items-center gap-2 rounded-md border bg-muted/40 px-3">
                    {finalPrice === null ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      <>
                        <span className="text-sm font-semibold text-foreground">{BRL.format(finalPrice)}</span>
                        {hasDiscount && (
                          <>
                            <span className="text-xs text-muted-foreground line-through">{BRL.format(priceNum)}</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">-{Math.round(discPercent)}%</Badge>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Images ──────────────────────────────────────────── */}
            <section className="grid gap-3 border-t pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Images <span className="text-destructive">*</span>
                </h3>
                <span className={`text-xs ${totalImages > MAX_IMAGES ? "text-destructive" : "text-muted-foreground"}`}>
                  {totalImages} / {MAX_IMAGES}
                </span>
              </div>
              <p className="-mt-1 text-xs text-muted-foreground">
                {editingId
                  ? `Entre ${MIN_IMAGES} e ${MAX_IMAGES} imagens. Alterações nas imagens salvas são aplicadas imediatamente.`
                  : `Entre ${MIN_IMAGES} e ${MAX_IMAGES} imagens. A primeira é a principal.`}
              </p>

              {/* Saved images — delete / set-main act on the server right away. */}
              {editingId && (imagesLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : existingImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map(img => (
                    <div key={img.id} className="relative overflow-hidden rounded-lg border">
                      <div className="relative aspect-square">
                        {img.url ? (
                          <Image src={img.url} alt="product image" fill sizes="120px" className="object-cover" />
                        ) : (
                          <div className="h-full bg-muted" />
                        )}
                        {img.isMain && (
                          <div className="absolute top-1 left-1">
                            <Badge className="gap-1 px-1.5 py-0.5 text-[10px]">
                              <Star size={9} fill="currentColor" /> Main
                            </Badge>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                          aria-label="Delete image"
                          title="Delete image"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {!img.isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMain(img.id)}
                          className="flex w-full items-center justify-center gap-1 bg-muted/50 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Star size={11} /> Set main
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Nenhuma imagem salva.</p>
              ))}

              {totalImages < MAX_IMAGES ? (
                <div className={shaking.files ? "shake" : ""}>
                  <label
                    onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                    onDrop={e => { e.preventDefault(); setDragActive(false); addFiles(e.dataTransfer.files); }}
                    className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-7 cursor-pointer
                      text-sm transition-colors
                      ${dragActive ? "border-primary bg-primary/5 text-primary"
                        : errors.files ? "border-destructive text-destructive"
                        : "border-border text-muted-foreground hover:bg-accent/50"}`}
                  >
                    <Upload size={22} />
                    <span className="font-medium">
                      {dragActive ? "Drop images here" : "Drag & drop or click to upload"}
                    </span>
                    <span className="text-xs text-muted-foreground">PNG, JPG — até {MAX_FILE_SIZE_MB}MB cada</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={e => { addFiles(e.target.files); e.target.value = ""; }}
                    />
                  </label>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
                  Máximo de {MAX_IMAGES} imagens — remova uma para adicionar outra.
                </div>
              )}

              {errors.files && (
                <p className="text-xs text-destructive">
                  {totalImages > MAX_IMAGES
                    ? `Mantenha no máximo ${MAX_IMAGES} imagens.`
                    : `Pelo menos ${MIN_IMAGES} imagem é obrigatória.`}
                </p>
              )}

              {form.files.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {form.files.map((file, i) => (
                    <div key={`${file.name}-${file.lastModified}-${i}`} className="relative rounded-lg overflow-hidden border aspect-square">
                      {previews[i] && (
                        // eslint-disable-next-line @next/next/no-img-element -- local blob preview, cannot use next/image
                        <img
                          src={previews[i]}
                          alt={file.name}
                          className="object-cover w-full h-full"
                        />
                      )}
                      {/* The first file becomes main, and only when nothing is saved yet. */}
                      {i === 0 && existingImages.length === 0 ? (
                        <div className="absolute top-1 left-1">
                          <Badge className="text-xs px-1.5 py-0.5 gap-1">
                            <Star size={9} fill="currentColor" /> Main
                          </Badge>
                        </div>
                      ) : existingImages.length === 0 && (
                        <button
                          type="button"
                          onClick={() => makePendingMain(i)}
                          className="absolute bottom-1 left-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                          aria-label={`Use ${file.name} as main image`}
                          title="Use as main image"
                        >
                          <Star size={12} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, files: prev.files.filter((_, j) => j !== i) }))}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Collections ─────────────────────────────────────── */}
            {collections.length > 0 && (
              <section className="grid gap-3 border-t pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Collections
                  {form.collectionIds.length > 0 && (
                    <span className="ml-1.5 font-normal normal-case text-muted-foreground">
                      ({form.collectionIds.length} selected)
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {collections.map(col => {
                    const active = form.collectionIds.includes(col.id);
                    return (
                      <label
                        key={col.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors select-none
                          ${active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent"
                          }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={active}
                          onChange={() => toggleCollection(col.id)}
                        />
                        {active && <Check size={13} />}
                        {col.name}
                      </label>
                    );
                  })}
                </div>
              </section>
            )}
            {/* ── Categories ──────────────────────────────────────── */}
            {categories.length > 0 && (
              <section className="grid gap-3 border-t pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Categories
                  {form.categoryIds.length > 0 && (
                    <span className="ml-1.5 font-normal normal-case text-muted-foreground">
                      ({form.categoryIds.length} selected)
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => {
                    const active = form.categoryIds.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors select-none
                          ${active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent"
                          }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={active}
                          onChange={() => toggleCategory(cat.id)}
                        />
                        {active && <Check size={13} />}
                        {cat.name}
                      </label>
                    );
                  })}
                </div>
              </section>
            )}

          </form>

          <SheetFooter className="border-t">
            {/* Upload progress — only meaningful once bytes are actually moving. */}
            {submitting && uploadPct > 0 && (
              <div className="mb-2 w-full">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{uploadPct < 100 ? "Enviando imagens…" : "Processando…"}</span>
                  <span>{uploadPct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-200"
                    style={{ width: `${uploadPct}%` }}
                  />
                </div>
              </div>
            )}
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="product-form" disabled={submitting}>
              {submitting && <Loader2 size={15} className="animate-spin mr-2" />}
              {editingId ? "Save Changes" : "Create Product"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  );
}
