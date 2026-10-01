"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { sanitizeRedirect } from "@/lib/utils";
import { Button } from "@/primitives/button";
import { Card, CardContent } from "@/primitives/card";
import { Input } from "@/primitives/input";
import { Label } from "@/primitives/label";
import { Separator } from "@/primitives/separator";

// Campos altos no mobile (alvo de toque confortável); text-base evita o zoom do iOS no foco.
const fieldClass = "h-11 md:h-10";
const sectionLabel = "mb-3 text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground";

export default function SignUpPageClient() {
  const { register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [cep, setCep] = useState("");
  const [numberAddress, setNumberAddress] = useState("");
  const [bairro, setBairro] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [redirectQs, setRedirectQs] = useState("");

  // Preserve the ?redirect= target so the "Entrar" link keeps it too.
  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (redirect) setRedirectQs(`?redirect=${encodeURIComponent(redirect)}`);
  }, []);

  const handleCepChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5, 8)}` : value;
    setCep(formatted);
    setCepError("");

    if (value.length === 8) {
      try {
        setCepLoading(true);
        const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await res.json();
        if (data.erro) {
          setCepError("CEP não encontrado");
          return;
        }
        setStreet(data.logradouro || "");
        setCity(data.localidade || "");
        setBairro(data.bairro || "");
      } catch {
        setCepError("Erro ao buscar CEP");
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 7) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    else if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    else if (digits.length > 0) formatted = `(${digits}`;
    setPhone(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(firstName, lastName, email, password, street, city, cep, numberAddress, bairro, phone);
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      router.push(sanitizeRedirect(redirect));
    } catch (err) {
      setError("Falha no cadastro. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh w-full md:grid-cols-2">
      {/* Left — image (hidden on mobile) */}
      <div className="relative hidden md:block">
        <Image
          alt="Imagem de fundo do cadastro"
          className="object-cover"
          fill
          priority
          sizes="(max-width: 768px) 0vw, 50vw"
          src="https://images.unsplash.com/photo-1719811059181-09032aef07b8?q=80&w=1200&auto=format&fit=crop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Right — form */}
      <div className="flex justify-center px-4 py-8 sm:px-6 md:items-center md:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Brenda Nunes
            </span>
            <h2 className="font-display text-2xl font-normal uppercase tracking-[0.12em] sm:text-3xl">Criar Conta</h2>
            <p className="text-sm text-muted-foreground">
              Preencha seus dados para criar sua conta
            </p>
          </div>

          {/* No mobile o formulário ocupa a tela toda; o card só aparece a partir de sm. */}
          <Card className="gap-0 rounded-none border-none bg-transparent py-0 shadow-none sm:rounded-xl sm:bg-card sm:py-6 sm:shadow-sm">
            <CardContent className="px-0 sm:px-6">
              <form className="space-y-6" onSubmit={handleSubmit}>

                {/* Dados pessoais */}
                <fieldset className="space-y-4">
                  <legend className={sectionLabel}>Seus dados</legend>

                  <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 min-[380px]:gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input
                        id="firstName"
                        className={fieldClass}
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="João"
                        autoComplete="given-name"
                        enterKeyHint="next"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input
                        id="lastName"
                        className={fieldClass}
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Silva"
                        autoComplete="family-name"
                        enterKeyHint="next"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      className={fieldClass}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="nome@exemplo.com"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      enterKeyHint="next"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      className={fieldClass}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password"
                      enterKeyHint="next"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Celular</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      className={fieldClass}
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="(11) 98888-0000"
                      autoComplete="tel-national"
                      enterKeyHint="next"
                      required
                    />
                  </div>
                </fieldset>

                {/* Endereço */}
                <fieldset className="space-y-4">
                  <legend className={sectionLabel}>Endereço</legend>

                  <div className="grid gap-2">
                    <Label htmlFor="cep">CEP</Label>
                    <div className="relative">
                      <Input
                        id="cep"
                        inputMode="numeric"
                        className={`${fieldClass} pr-10`}
                        value={cep}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        maxLength={9}
                        autoComplete="postal-code"
                        enterKeyHint="next"
                        aria-invalid={!!cepError}
                        aria-describedby={cepError ? "cep-error" : "cep-hint"}
                        required
                      />
                      {cepLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {cepError ? (
                      <p id="cep-error" className="text-xs text-destructive">{cepError}</p>
                    ) : (
                      <p id="cep-hint" className="text-xs text-muted-foreground">
                        Preenchemos rua, bairro e cidade pelo CEP.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-[1fr_6rem] gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        value={street}
                        onChange={e => setStreet(e.target.value)}
                        placeholder="Rua das Flores"
                        autoComplete="address-line1"
                        readOnly={!!street && cep.replace(/\D/g, "").length === 8}
                        className={`${fieldClass} ${street && cep.replace(/\D/g, "").length === 8 ? "bg-muted cursor-not-allowed" : ""}`}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="numberAddress">Número</Label>
                      <Input
                        id="numberAddress"
                        inputMode="numeric"
                        className={fieldClass}
                        value={numberAddress}
                        onChange={e => setNumberAddress(e.target.value)}
                        placeholder="123"
                        autoComplete="address-line2"
                        enterKeyHint="next"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      className={fieldClass}
                      value={bairro}
                      onChange={e => setBairro(e.target.value)}
                      placeholder="Centro"
                      autoComplete="address-level3"
                      enterKeyHint="next"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      className={fieldClass}
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="São Paulo"
                      autoComplete="address-level2"
                      enterKeyHint="done"
                      required
                    />
                  </div>
                </fieldset>

                {error && (
                  <p role="alert" className="text-sm font-medium text-destructive">{error}</p>
                )}

                {/* Aviso de consentimento (LGPD, art. 7º/8º) */}
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Ao criar sua conta, você concorda com nossos{" "}
                  <Link href="/termos" className="font-medium text-foreground underline-offset-4 hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e com o tratamento de dados descrito na{" "}
                  <Link href="/privacidade" className="font-medium text-foreground underline-offset-4 hover:underline">
                    Política de Privacidade
                  </Link>
                  .
                </p>

                <Button className="h-12 w-full rounded-sm text-[0.7rem] uppercase tracking-[0.15em] md:h-10" disabled={loading} type="submit">
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Criando conta...</>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link href={`/auth/sign-in${redirectQs}`} className="inline-block py-2 font-medium text-foreground underline-offset-4 hover:underline">
                  Entrar
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
