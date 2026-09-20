import { useEffect } from "react";

const HREF =
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap";

/** Montserrat e Playfair só servem às páginas de lançamento/oportunidade:
 *  carregam ao entrar nelas em vez de pesar todas as páginas do site. */
export function useLaunchFonts() {
  useEffect(() => {
    if (document.head.querySelector(`link[href="${HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = HREF;
    document.head.appendChild(link);
  }, []);
}
