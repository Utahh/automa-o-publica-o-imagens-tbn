import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { agency, broker, properties } from "../data/property";
import styles from "./Hero.module.css";

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % properties.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const go = (dir) => {
    setIndex((i) => (i + dir + properties.length) % properties.length);
  };

  return (
    <section id="topo" className={styles.hero}>
      <div className={styles.slides}>
        <AnimatePresence initial={false}>
          <motion.img
            key={properties[index].gallery[0].src}
            src={properties[index].gallery[0].src}
            alt={properties[index].gallery[0].alt}
            className={styles.slideImg}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
        <div className={styles.overlay} />
      </div>

      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => go(-1)} aria-label="Foto anterior">
        <LuChevronLeft />
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => go(1)} aria-label="Próxima foto">
        <LuChevronRight />
      </button>

      <div className={styles.dots}>
        {properties.map((p, i) => (
          <button
            key={p.id}
            className={i === index ? styles.dotActive : styles.dot}
            onClick={() => setIndex(i)}
            aria-label={`Ver imóvel ${i + 1}`}
          />
        ))}
      </div>

      <div className={`container ${styles.content}`}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <span className={styles.badge}>{agency.name} · Botucatu/SP</span>
          <h1 className={styles.title}>{agency.tagline}</h1>
          <p className={styles.address}>
            Casas e apartamentos para comprar ou alugar, com o acompanhamento pessoal de{" "}
            {broker.name}.
          </p>

          <div className={styles.ctaRow}>
            <a href="#imoveis" className="btn btn-primary">
              Ver imóveis disponíveis
            </a>
            <a
              href={`https://wa.me/${broker.whatsapp}?text=${encodeURIComponent(
                "Olá! Gostaria de saber mais sobre os imóveis da TBN Imóveis."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              Falar no WhatsApp
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        className={styles.scrollCue}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <span />
      </motion.div>
    </section>
  );
}
