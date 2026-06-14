"use client"

import { Button } from "@/primitives/button";
import { Card, CardContent } from "@/primitives/card";
import { Input } from "@/primitives/input";
import { Label } from "@/primitives/label";
import { Separator } from "@/primitives/separator";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function SignInPageClient() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError("E-mail ou senha inválidos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen w-screen md:grid-cols-2">
      {/* Left — image (hidden on mobile) */}
      <div className="relative hidden md:block">
        <Image
          alt="Imagem de fundo do login"
          className="object-cover"
          fill
          priority
          sizes="(max-width: 768px) 0vw, 50vw"
          src="https://images.unsplash.com/photo-1719811059181-09032aef07b8?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-3xl font-bold">Entrar</h2>
            <p className="text-sm text-muted-foreground">
              Digite suas credenciais para acessar sua conta
            </p>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="pt-4">
              <form
                className="space-y-4"
                onSubmit={(e) => { e.preventDefault(); void handleEmailLogin(e); }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@exemplo.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link
                      className="text-sm text-muted-foreground hover:underline"
                      href="#"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </div>

                {error && (
                  <div className="text-sm font-medium text-destructive">{error}</div>
                )}

                <Button className="w-full" disabled={loading} type="submit">
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link
                  className="text-primary underline-offset-4 hover:underline"
                  href="/auth/sign-up"
                >
                  Cadastre-se
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
