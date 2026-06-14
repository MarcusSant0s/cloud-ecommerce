"use client";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function OrderFailure() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold">Pagamento não aprovado</h1>
        <p className="text-muted-foreground">
          Tente novamente ou escolha outra forma de pagamento.
        </p>
        <div className="flex flex-col gap-2 w-full sm:flex-row sm:justify-center">
          <button
            onClick={() => router.back()}
            className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
          >
            Tentar novamente
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-accent sm:w-auto"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
