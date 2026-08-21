import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { broker } from "../data/property";
import useStickyVisible from "../hooks/useStickyVisible";
import styles from "./StickyBar.module.css";

export default function StickyBar() {
  const visible = useStickyVisible();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.bar}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.info}>
            <strong>Quer ajuda para achar seu imóvel ideal?</strong>
            <span>Fale com {broker.name.split(" ")[0]}, {broker.creci}</span>
          </div>
          <div className={styles.actions}>
            <a
              href={`https://wa.me/${broker.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              WhatsApp
            </a>
            <Link to="/#imoveis" className="btn btn-primary">
              Ver imóveis
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
