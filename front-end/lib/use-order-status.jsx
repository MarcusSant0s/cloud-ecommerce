"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/services/api";

const POLL_INTERVAL_MS = 5000;

// Teto para não ficar consultando indefinidamente numa aba esquecida aberta.
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Acompanha um pedido até ele sair de PENDING.
 *
 * Pix confirma de forma assíncrona: o Mercado Pago devolve o usuário para cá
 * antes de o webhook chegar, então o pedido ainda está PENDING no nosso banco no
 * instante em que a página monta. Em vez de exigir F5, a página pergunta o
 * status de tempos em tempos e se atualiza sozinha quando o pagamento cai.
 *
 * Estados: "loading" (primeira consulta), "waiting" (ainda PENDING),
 * "settled" (saiu de PENDING), "timeout" (desistimos de esperar), "error".
 */
export function useOrderStatus(orderId) {
  const [order, setOrder] = useState(null);
  const [state, setState] = useState("loading");
  const timerRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!orderId) return;

    cancelledRef.current = false;
    const startedAt = Date.now();

    async function check() {
      try {
        const res = await api.get(`/order/${orderId}`);
        if (cancelledRef.current) return;

        setOrder(res.data);

        const status = res.data?.status?.toUpperCase();
        if (status && status !== "PENDING") {
          setState("settled");
          return;
        }

        if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
          setState("timeout");
          return;
        }

        setState("waiting");
        timerRef.current = setTimeout(check, POLL_INTERVAL_MS);
      } catch {
        // Uma falha de rede isolada não deve encerrar a espera; só desiste
        // quando não há mais o que esperar.
        if (cancelledRef.current) return;
        if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
          setState("timeout");
          return;
        }
        setState(prev => (prev === "loading" ? "error" : prev));
        timerRef.current = setTimeout(check, POLL_INTERVAL_MS);
      }
    }

    check();

    return () => {
      cancelledRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [orderId]);

  // Sem id na URL não há o que consultar. Derivado no render em vez de setado
  // dentro do efeito, que dispararia um render em cascata à toa.
  return { order, state: orderId ? state : "error" };
}
