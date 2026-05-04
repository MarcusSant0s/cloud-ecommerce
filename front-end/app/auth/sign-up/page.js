"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/primitives/button";
import { Card, CardContent } from "@/primitives/card";
import { Input } from "@/primitives/input";
import { Label } from "@/primitives/label";
import { Separator } from "@/primitives/separator";

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

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

// state de loading do CEP
const [cepLoading, setCepLoading] = useState(false);
const [cepError, setCepError] = useState("");

// busca o endereço quando CEP tem 8 dígitos
const handleCepChange = async (e) => {
  const value = e.target.value.replace(/\D/g, ""); // só números
  const formatted = value.length > 5 ? `${value.slice(0,5)}-${value.slice(5,8)}` : value;
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

      // preenche automaticamente
      setStreet(data.logradouro || "");
      setCity(data.localidade || "");
    } catch {
      setCepError("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(firstName, lastName, email, password, street, city, cep, numberAddress);
      router.push("/");
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen w-screen md:grid-cols-2">
      {/* Left — image */}
      <div className="relative hidden md:block">
        <Image
          alt="Sign-up background"
          className="object-cover"
          fill
          priority
          sizes="(max-width: 768px) 0vw, 50vw"
          src="https://images.unsplash.com/photo-1719811059181-09032aef07b8?q=80&w=1200&auto=format&fit=crop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="text-sm text-muted-foreground">
              Enter your details to create your account
            </p>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="pt-2">
              <form className="space-y-4" onSubmit={handleSubmit}>

                {/* Personal info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Address */}
                <div className="pt-1">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Address
                  </p>
                  <div className="flex flex-col gap-3">
                    <Input
                      id="street"
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      placeholder="Rua das Flores"
                      readOnly={!!street && cep.replace(/\D/g, "").length === 8}
                      className={street && cep.replace(/\D/g, "").length === 8 ? "bg-muted cursor-not-allowed" : ""}
                      required
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          placeholder="São Paulo"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="numberAddress">Number</Label>
                        <Input
                          id="numberAddress"
                          value={numberAddress}
                          onChange={e => setNumberAddress(e.target.value)}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                    <Label htmlFor="cep">CEP</Label>
                    <div className="relative">
                      <Input
                        id="cep"
                        value={cep}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        maxLength={9}
                        required
                      />
                      {cepLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {cepError && (
                      <p className="text-xs text-destructive">{cepError}</p>
                    )}
                  </div>
                 </div>
                </div>

                {error && (
                  <p className="text-sm font-medium text-destructive">{error}</p>
                )}

                <Button className="w-full" disabled={loading} type="submit">
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/sign-in" className="text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}