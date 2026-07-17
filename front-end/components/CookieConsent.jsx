"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/primitives/button";

const STORAGE_KEY = "cookie-consent";

// Registra a escolha do titular (LGPD, art. 8º — consentimento comprovável).
function saveConsent(value) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ value, date: new Date().toISOString() })
  );
}

// localStorage como store externo: no servidor o snapshot é "pendente",
// então o banner só aparece após a hidratação e sem mismatch.
const subscribe = (cb) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
const getSnapshot = () => localStorage.getItem(STORAGE_KEY);
const getServerSnapshot = () => "__server__";

const CookieConsent = () => {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // setItem não dispara "storage" na própria aba — este estado fecha o banner.
  const [dismissed, setDismissed] = useState(false);

  const visible = !dismissed && stored === null;
  if (!visible) return null;

  const choose = (value) => {
    saveConsent(value);
    setDismissed(true);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85"
    >
      <div className="container mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Utilizamos armazenamento local e tecnologias semelhantes, essenciais
          para manter sua sessão e o funcionamento da loja. Ao continuar, você
          concorda com o tratamento de dados descrito em nossa{" "}
          <Link
            href="/privacidade"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Política de Privacidade
          </Link>
          , conforme a LGPD (Lei nº 13.709/2018).
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-sm text-[0.7rem] uppercase tracking-[0.15em]"
            onClick={() => choose("essential")}
          >
            Apenas essenciais
          </Button>
          <Button
            size="sm"
            className="rounded-sm text-[0.7rem] uppercase tracking-[0.15em]"
            onClick={() => choose("accepted")}
          >
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
