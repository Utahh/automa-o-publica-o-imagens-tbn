import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "wheel"] as const;

/** Desloga sozinho depois de `timeoutMs` sem nenhuma interação — evita
 *  deixar o painel aberto (com dados de rascunho/imóvel) numa máquina
 *  compartilhada ou esquecida. Qualquer evento de mouse/teclado/toque
 *  reseta a contagem. */
export function useInactivityLogout(timeoutMs: number, onTimeout: () => void, enabled = true) {
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => onTimeoutRef.current(), timeoutMs);
    };

    reset();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, reset, { passive: true });
    }

    return () => {
      clearTimeout(timer);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, reset);
      }
    };
  }, [timeoutMs, enabled]);
}
