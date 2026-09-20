import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Rolagem por cards de um carrossel horizontal (o scroller deve marcar cada card com `data-card`). */
export function useCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  function scrollByCards(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]") as HTMLElement | null;
    const distance = (card?.offsetWidth ?? 260) + 16;
    el.scrollBy({ left: distance * direction, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return { scrollerRef, scrollByCards };
}

export function CarouselArrows({ onScroll }: { onScroll: (direction: -1 | 1) => void }) {
  const base =
    "flex h-11 w-11 items-center justify-center rounded-full border border-grafite/15 text-grafite [touch-action:manipulation] transition-colors hover:bg-white";
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onScroll(-1)} aria-label="Imóveis anteriores" className={base}>
        <ChevronLeft className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
      </button>
      <button type="button" onClick={() => onScroll(1)} aria-label="Próximos imóveis" className={base}>
        <ChevronRight className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
      </button>
    </div>
  );
}

export function CarouselTrack({
  scrollerRef,
  children,
}: {
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <div
      ref={scrollerRef}
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pl-1 pr-6 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </div>
  );
}
