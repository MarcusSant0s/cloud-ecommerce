"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import {
  ArrowLeft, User, MapPin, Mail, Save,
  CheckCircle2, AlertCircle, Loader2, Edit3
} from "lucide-react";
import { toast } from "sonner";

function Field({ label, name, type = "text", value, onChange, error, icon: Icon, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full rounded-xl border bg-background px-4 py-2.5 text-sm
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
    <div className="container mx-auto max-w-2xl px-4 py-10 flex flex-col gap-6">
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
  const { user, loading: authLoading, fetchMe } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    cep: "",
    number: "",
  });

  useEffect(() => {
    console.log(user)
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        street: user.userAdress?.street ?? "",
        city: user.userAdress?.city ?? "",
        cep: user.userAdress?.cep ?? "",
        number: user.userAdress?.number ?? "",
      });
    }
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    console.log(name + ", valor:"+ value)
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
      <div className="container mx-auto max-w-2xl px-4 py-8 md:py-10">

        <div className="mb-6 flex items-center gap-4 md:mb-8">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm transition hover:bg-accent"
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
          <div className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar firstName={form.firstName} lastName={form.lastName} />
              <div>
                <p className="font-semibold text-base leading-tight sm:text-lg">
                  {form.firstName} {form.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{form.email}</p>
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
                className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:bg-accent"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </button>
            )}
          </div>

          {/* Personal info */}
          <SectionCard title="Informações Pessoais" icon={User}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Nome"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                error={errors.firstName}
                disabled={!editing}
              />
              <Field
                label="Sobrenome"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                error={errors.lastName}
                disabled={!editing}
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
            />
          </SectionCard>

          {/* Address */}
          <SectionCard title="Endereço" icon={MapPin}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label="Rua"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  error={errors.street}
                  disabled={!editing}
                />
              </div>
              <Field
                label="Cidade"
                name="city"
                value={form.city}
                onChange={handleChange}
                error={errors.city}
                disabled={!editing}
              />
              <Field
                label="CEP"
                name="cep"
                value={form.cep}
                onChange={handleChange}
                error={errors.cep}
                disabled={!editing}
              />
              <Field
                label="Número"
                name="number"
                value={form.number}
                onChange={handleChange}
                error={errors.number}
                disabled={!editing}
              />
            </div>
          </SectionCard>

          {/* Actions */}
          {editing && (
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-accent disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
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
      </div>
    </div>
  );
}
