import { useEffect } from "react";

const SITE_NAME = "Toninho Bomnome";
const DEFAULT_IMAGE = "/og-image.png";

interface Seo {
  /** Sem o sufixo do site — ele é acrescentado aqui. */
  title?: string;
  description?: string;
  /** Caminho (ex.: "/imoveis") ou URL absoluta. */
  image?: string;
  noindex?: boolean;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Título, descrição, canonical e Open Graph por página (SPA). */
export function useSeo({ title, description, image, noindex }: Seo) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · Corretor de Imóveis`;
    const url = `${window.location.origin}${window.location.pathname}`;
    const img = new URL(image ?? DEFAULT_IMAGE, window.location.origin).href;

    document.title = fullTitle;
    setCanonical(url);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);
    setMeta("name", "twitter:image", img);
    setMeta("name", "twitter:card", "summary_large_image");
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
    }
    setMeta("name", "robots", noindex ? "noindex" : "index,follow");
  }, [title, description, image, noindex]);
}
