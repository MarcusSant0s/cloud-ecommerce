"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import {
  ArrowLeft, User, MapPin, Mail, Save,
  CheckCircle2, AlertCircle, Loader2, Edit3, Trash2
} from "lucide-react";
import { toast } from "sonner";

function Field({ label, name, type = "text", value, onChange, error, icon: Icon, disabled, className = "", ...inputProps }) {
  const id = `field-${name}`;
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={!!error}
          {...inputProps}
          className={`
            h-11 w-full rounded-xl border bg-background px-4 text-base md:text-sm
            transition-all outline-none
            focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? "pl-10" : ""}
            ${error ? "border-destructive focus:ring-destructive/20" : "border-input"}
          `}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

function Avatar({ firstName, lastName }) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  return (
    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-xl font-bold text-primary-foreground shadow-lg sm:h-20 sm:w-20 sm:text-2xl">
      {initials || <User className="h-8 w-8" />}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3.5">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 flex flex-col gap-5 md:py-10">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
        <Skeleton className="h-20 w-20 rounded-2xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="rounded-2xl border bg-card p-5 flex flex-col gap-4">
        <Skeleton className="h-3 w-24" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
      <div className="rounded-2xl border bg-card p-5 flex flex-col gap-4">
        <Skeleton className="h-3 w-24" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    </div>
  );
}

function validate(form) {
  const errors = {};
  if (!form.firstName?.trim()) errors.firstName = "Obrigatório";
  if (!form.lastName?.trim()) errors.lastName = "Obrigatório";
  if (!form.email?.trim()) errors.email = "Obrigatório";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "E-mail inválido";
  if (!form.street?.trim()) errors.street = "Obrigatório";
  if (!form.city?.trim()) errors.city = "Obrigatório";
  if (!form.cep?.trim()) errors.cep = "Obrigatório";
  if (!form.number?.trim()) errors.number = "Obrigatório";
  return errors;
}

export default function AccountPage() {
  const { user, loading: authLoading, fetchMe, logout } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    cep: "",
    number: "",
    bairro: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        street: user.userAdress?.street ?? "",
        city: user.userAdress?.city ?? "",
        cep: user.userAdress?.cep ?? "",
        number: user.userAdress?.number ?? "",
        bairro: user.userAdress?.bairro ?? "",
        phone: user.userAdress?.phone ?? "",
      });
    }
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);
      await api.put("/users/UpdateMe", form);
      setSuccess(true);
      setEditing(false);
      toast.success("Perfil atualizado!");
      if (typeof fetchMe === "function") await fetchMe();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      toast.error("Falha ao atualizar perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  // Direito de eliminação (LGPD, art. 18, VI): remove conta, pedidos e endereço.
  async function handleDeleteAccount() {
    try {
      setDeleting(true);
      await api.delete("/users/me");
      toast.success("Conta excluída. Sentiremos sua falta!");
      logout();
    } catch {
      toast.error("Falha ao excluir a conta. Tente novamente.");
      setDeleting(false);
    }
  }

  function handleCancel() {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        street: user.userAdress?.street ?? "",
        city: user.userAdress?.city ?? "",
        cep: user.userAdress?.cep ?? "",
        number: user.userAdress?.number ?? "",
        bairro: user.userAdress?.bairro ?? "",
        phone: user.userAdress?.phone ?? "",
      });
    }
    setErrors({});
    setEditing(false);
  }

  if (authLoading) return <PageSkeleton />;

  if (!user) {
    router.push("/auth/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-6 md:py-10">

        <div className="mb-6 flex items-center gap-4 md:mb-8">
          <Link
            href="/"
            aria-label="Voltar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm transition hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Minha Conta</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Gerencie suas informações pessoais</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Profile summary */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="shrink-0">
                <Avatar firstName={form.firstName} lastName={form.lastName} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-base leading-tight sm:text-lg">
                  {form.firstName} {form.lastName}
                </p>
                <p className="truncate text-sm text-muted-foreground">{form.email}</p>
                {success && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Perfil atualizado
                  </p>
                )}
              </div>
            </div>
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition hover:bg-accent"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </button>
            )}
          </div>

          {/* Personal info */}
          <SectionCard title="Informações Pessoais" icon={User}>
            <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 min-[380px]:gap-3 sm:gap-4">
              <Field
                label="Nome"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                error={errors.firstName}
                disabled={!editing}
                autoComplete="given-name"
              />
              <Field
                label="Sobrenome"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                error={errors.lastName}
                disabled={!editing}
                autoComplete="family-name"
              />
            </div>
            <Field
              label="E-mail"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              icon={Mail}
              disabled={!editing}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
            />
            <Field
              label="Celular"
              name="phone"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              disabled={!editing}
              autoComplete="tel-national"
            />
          </SectionCard>

          {/* Address — CEP e número lado a lado já no mobile: são curtos */}
          <SectionCard title="Endereço" icon={MapPin}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Field
                label="CEP"
                name="cep"
                inputMode="numeric"
                value={form.cep}
                onChange={handleChange}
                error={errors.cep}
                disabled={!editing}
                autoComplete="postal-code"
              />
              <Field
                label="Número"
                name="number"
                inputMode="numeric"
                value={form.number}
                onChange={handleChange}
                error={errors.number}
                disabled={!editing}
                autoComplete="address-line2"
              />
              <Field
                className="col-span-2"
                label="Rua"
                name="street"
                value={form.street}
                onChange={handleChange}
                error={errors.street}
                disabled={!editing}
                autoComplete="address-line1"
              />
              <Field
                className="col-span-2 sm:col-span-1"
                label="Bairro"
                name="bairro"
                value={form.bairro}
                onChange={handleChange}
                error={errors.bairro}
                disabled={!editing}
                autoComplete="address-level3"
              />
              <Field
                className="col-span-2 sm:col-span-1"
                label="Cidade"
                name="city"
                value={form.city}
                onChange={handleChange}
                error={errors.city}
                disabled={!editing}
                autoComplete="address-level2"
              />
            </div>
          </SectionCard>

          {/* Actions — barra fixa no rodapé no mobile, para salvar sem rolar até o fim */}
          {editing && (
            <div className="sticky bottom-0 z-10 -mx-4 flex gap-3 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="h-11 flex-1 rounded-xl border px-5 text-sm font-medium transition hover:bg-accent disabled:opacity-50 sm:flex-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50 sm:flex-none"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                ) : (
                  <><Save className="h-4 w-4" /> Salvar Alterações</>
                )}
              </button>
            </div>
          )}

        </form>

        {/* Excluir conta — direito de eliminação (LGPD, art. 18, VI) */}
        <div className="mt-5 rounded-2xl border border-destructive/30 bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-5 py-3.5">
            <Trash2 className="h-4 w-4 text-destructive" />
            <h2 className="text-sm font-semibold text-destructive">Excluir conta</h2>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Exclui permanentemente sua conta, seus pedidos, seu carrinho e seu
              endereço, conforme previsto na nossa{" "}
              <Link href="/privacidade" className="font-medium text-foreground underline-offset-4 hover:underline">
                Política de Privacidade
              </Link>
              . Esta ação não pode ser desfeita.
            </p>
            {confirmingDelete ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <span className="text-sm font-medium text-destructive">
                  Tem certeza? Todos os seus dados serão apagados.
                </span>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-medium text-white shadow-sm transition hover:bg-destructive/90 disabled:opacity-50"
                >
                  {deleting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Excluindo...</>
                  ) : (
                    "Sim, excluir minha conta"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="h-11 rounded-xl border px-4 text-sm font-medium transition hover:bg-accent disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="h-11 w-full rounded-xl border border-destructive/40 px-4 text-sm sm:w-auto sm:self-start font-medium text-destructive transition hover:bg-destructive/10"
              >
                Excluir minha conta
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
