import { LuPhone, LuMessageCircle, LuBadgeCheck } from "react-icons/lu";
import { broker, agency } from "../data/property";
import { specIcons } from "./icons";
import Reveal from "./Reveal";
import styles from "./About.module.css";

export default function About() {
  return (
    <section id="sobre" className={`section ${styles.about}`}>
      <div className={`container ${styles.intro}`}>
        <Reveal className={styles.photoWrap}>
          <img src={broker.photo} alt={`Foto de ${broker.name}, corretor responsável pelo ${agency.name}`} />
          <span className={styles.creciTag}>
            <LuBadgeCheck /> {broker.creci}
          </span>
        </Reveal>

        <Reveal delay={0.15} className={styles.text}>
          <span className="eyebrow">Quem está por trás do {agency.name}</span>
          <h2 className="section-title">
            Olá, sou o {broker.name.split(" ")[0]}
            <span>{broker.role}</span>
          </h2>

          {broker.story.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}

          <div className={styles.contactRow}>
            <div className={styles.contactInfo}>
              <span>{broker.phone}</span>
              <span>{broker.instagram}</span>
            </div>
            <div className={styles.contactActions}>
              <a
                href={`https://wa.me/${broker.whatsapp}?text=${encodeURIComponent(
                  `Olá ${broker.name.split(" ")[0]}, queria conhecer melhor a ${agency.name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <LuMessageCircle /> WhatsApp
              </a>
              <a href={`tel:${broker.phone.replace(/\D/g, "")}`} className="btn btn-secondary">
                <LuPhone /> Ligar
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="container">
        <Reveal delay={0.1} className={styles.quoteBlock}>
          <p>“{broker.quote}”</p>
          <span>
            — {broker.name}, corretor responsável pelo {agency.name}
          </span>
        </Reveal>

        <div className={styles.valuesGrid}>
          {broker.values.map((value, i) => {
            const Icon = specIcons[value.icon];
            return (
              <Reveal key={value.title} delay={i * 0.1} className={styles.valueCard}>
                <span className={styles.valueIcon}>
                  <Icon />
                </span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
