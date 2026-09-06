import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import clsx from "clsx";
import { buildWhatsappLink } from "../data/agent";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  variant?: "floating" | "solid" | "outline";
  label?: string;
}

const defaultMessage =
  "Olá, Toninho! Vi o site e queria saber mais sobre um imóvel.";

export function WhatsAppButton({
  message = defaultMessage,
  className,
  variant = "solid",
  label = "Falar no WhatsApp",
}: WhatsAppButtonProps) {
  const href = buildWhatsappLink(message);
  const reduceMotion = useReducedMotion();

  if (variant === "floating") {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noreferrer"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.1, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        className={clsx(
          "fixed right-4 z-40 flex items-center gap-2 rounded-full bg-azul-escritura px-4 py-3 text-cinza-papel shadow-[0_10px_30px_-8px_rgba(15,18,20,0.5)] sm:right-6 sm:px-5 sm:py-3.5",
          className,
        )}
        aria-label={label}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 animate-ping rounded-full bg-azul-escritura/50 [animation-duration:2.6s] motion-reduce:animate-none"
        />
        <MessageCircle className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
        <span className="font-display text-sm font-semibold">{label}</span>
      </motion.a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={clsx(
        "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-display text-sm font-semibold tracking-tight transition-transform duration-200 active:scale-95",
        variant === "solid" && "bg-azul-escritura text-cinza-papel hover:bg-azul-escritura-forte",
        variant === "outline" &&
          "border border-cinza-papel/30 text-cinza-papel hover:border-cinza-papel hover:bg-cinza-papel/10",
        className,
      )}
    >
      <MessageCircle className="h-4.5 w-4.5 transition-transform group-hover:rotate-6" strokeWidth={2.25} aria-hidden="true" />
      {label}
    </a>
  );
}
