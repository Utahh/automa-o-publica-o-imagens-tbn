import { motion } from "framer-motion";
import { LuMessageCircle } from "react-icons/lu";
import { broker } from "../data/property";
import useStickyVisible from "../hooks/useStickyVisible";
import styles from "./FloatingWhatsApp.module.css";

export default function FloatingWhatsApp() {
  const stickyVisible = useStickyVisible();

  return (
    <motion.a
      href={`https://wa.me/${broker.whatsapp}?text=${encodeURIComponent(
        "Olá! Gostaria de saber mais sobre os imóveis da TBN Imóveis."
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.fab}
      aria-label="Falar no WhatsApp"
      style={{ pointerEvents: stickyVisible ? "none" : "auto" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: stickyVisible ? 0 : 1,
        opacity: stickyVisible ? 0 : 1,
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className={styles.pulse} />
      <LuMessageCircle />
    </motion.a>
  );
}
