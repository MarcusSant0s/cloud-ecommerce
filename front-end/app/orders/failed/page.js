"use client";
import { useRouter } from "next/navigation";

export default function OrderFailure() {
  const router = useRouter();

  return (
    <div>
      <h1>Pagamento não aprovado</h1>
      <p>Tente novamente ou escolha outra forma de pagamento.</p>
      <button onClick={() => router.back()}>Tentar novamente</button>
    </div>
  );
}