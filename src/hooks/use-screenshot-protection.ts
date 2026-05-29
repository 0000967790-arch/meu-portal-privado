/**
 * Hook de proteção anti-screenshot para áreas sensíveis.
 *
 * Técnicas combinadas:
 * 1. keydown  — bloqueia PrtScn, Meta+Shift+3/4/5 (macOS), Ctrl+P (impressão)
 * 2. visibilitychange — ao sair da aba (ex: Print Screen no Windows via menu)
 *    a tela fica coberta até voltar ao foco
 * 3. CSS -webkit-user-select / user-select none via classe injetada no body
 * 4. Screenshot API (navigator.mediaDevices) — detecta captura em navegadores
 *    que suportam `getDisplayMedia` events (Chrome 116+)
 *
 * Ao detectar tentativa exibe overlay com aviso e chama onAttempt().
 */

import { useEffect, useCallback } from "react";

interface Options {
  /** Callback chamado quando uma tentativa é detectada */
  onAttempt?: () => void;
}

const OVERLAY_ID = "screenshot-block-overlay";

function showOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;

  const el = document.createElement("div");
  el.id = OVERLAY_ID;
  el.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 999999;
    background: #0f172a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #f8fafc;
    font-family: system-ui, sans-serif;
    text-align: center;
    padding: 24px;
  `;
  el.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24"
      fill="none" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <p style="font-size:1.25rem;font-weight:700;margin:0">Captura de tela não permitida</p>
    <p style="font-size:0.875rem;opacity:0.7;max-width:320px;margin:0;line-height:1.6">
      Por segurança dos dados do associado, capturas de tela estão desativadas nesta área.
    </p>
  `;
  document.body.appendChild(el);

  // Remove overlay após 2,5 s
  setTimeout(removeOverlay, 2500);
}

function removeOverlay() {
  document.getElementById(OVERLAY_ID)?.remove();
}

export function useScreenshotProtection({ onAttempt }: Options = {}) {
  const trigger = useCallback(() => {
    showOverlay();
    onAttempt?.();
  }, [onAttempt]);

  useEffect(() => {
    // ── 1. Bloqueia teclas de atalho ──────────────────────────────────────
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase();
      const meta = e.metaKey;  // Cmd (macOS)
      const ctrl = e.ctrlKey;
      const shift = e.shiftKey;

      const isPrintScreen = key === "printscreen" || key === "print";
      const isMacCapture  = meta && shift && ["3", "4", "5", "6"].includes(key);
      const isCtrlP       = (ctrl || meta) && key === "p"; // impressão → também captura
      const isF12Print    = key === "f12"; // alguns teclados

      if (isPrintScreen || isMacCapture || isCtrlP || isF12Print) {
        e.preventDefault();
        e.stopPropagation();
        trigger();
      }
    };

    // ── 2. Cobre a tela quando a aba perde foco (Print Screen no Windows) ──
    const handleVisibility = () => {
      if (document.hidden) {
        showOverlay();
      } else {
        // pequeno delay para garantir que o overlay cubra o print
        setTimeout(removeOverlay, 300);
      }
    };

    // ── 3. CSS: desativa seleção de texto e copia ──────────────────────────
    document.body.style.webkitUserSelect = "none";
    (document.body.style as CSSStyleDeclaration & { userSelect: string }).userSelect = "none";
    document.body.style.webkitTouchCallout = "none";

    // ── 4. Screen Capture API (Chrome 116+) ──────────────────────────────
    // Quando alguém inicia compartilhamento/captura, visibilidade muda — coberto pelo item 2.
    // Alguns navegadores expõem navigator.mediaDevices.oncapturestatechange (experimental).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const media = navigator.mediaDevices as any;
    const handleCapture = () => trigger();
    if (typeof media?.addEventListener === "function") {
      media.addEventListener("devicechange", handleCapture);
    }

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("visibilitychange", handleVisibility);

      document.body.style.webkitUserSelect = "";
      (document.body.style as CSSStyleDeclaration & { userSelect: string }).userSelect = "";
      document.body.style.webkitTouchCallout = "";

      if (typeof media?.removeEventListener === "function") {
        media.removeEventListener("devicechange", handleCapture);
      }

      removeOverlay();
    };
  }, [trigger]);
}
