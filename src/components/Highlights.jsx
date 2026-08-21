import { motion } from "framer-motion";
import { highlights } from "../data/property";
import { specIcons } from "./icons";
import Reveal from "./Reveal";
import styles from "./Highlights.module.css";

export default function Highlights() {
  return (
    <section id="diferenciais" className={`section ${styles.highlights}`}>
      <div className="container">
        <Reveal>
          <span className="eyebrow">Como funciona</span>
          <h2 className="section-title">Do primeiro contato às chaves na mão</h2>
          <p className="section-subtitle">
            Um processo simples e transparente, acompanhado de perto pelo corretor em cada etapa.
          </p>
        </Reveal>

        <div className={styles.grid}>
          {highlights.map((item, i) => {
            const Icon = specIcons[item.icon];
            return (
              <Reveal key={item.title} delay={i * 0.12} className={styles.cardWrap}>
                <motion.div
                  className={styles.card}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className={styles.step}>0{i + 1}</span>
                  <span className={styles.icon}>
                    <Icon />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
