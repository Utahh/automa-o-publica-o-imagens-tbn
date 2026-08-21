import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuArrowLeft,
  LuCheck,
  LuMessageCircle,
  LuPhone,
  LuExpand,
  LuX,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import { useProperties, broker, agency } from "../data/property";
import { specIcons } from "../components/icons";
import Reveal from "../components/Reveal";
import styles from "./PropertyPage.module.css";

const formatBRL = (value, dealType) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    value
  ) + (dealType === "Aluguel" ? "/mês" : "");

export default function PropertyPage() {
  const { id } = useParams();
  const { properties, loading } = useProperties();
  const property = properties.find((p) => p.id === id);
  const others = properties.filter((p) => p.id !== id);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    document.title = property
      ? `${property.title} | ${agency.name}`
      : `Imóvel não encontrado | ${agency.name}`;
    window.scrollTo(0, 0);
  }, [property]);

  if (loading) {
    return (
      <div className={styles.notFound}>
        <p style={{ color: "var(--text-muted, #888)", fontSize: "1.1rem" }}>Carregando imóvel...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={styles.notFound}>
        <h1>Imóvel não encontrado</h1>
        <p>Este imóvel pode não estar mais disponível.</p>
        <Link to="/#imoveis" className="btn btn-primary">
          Ver imóveis disponíveis
        </Link>
      </div>
    );
  }

  const gallery = property.gallery;
  const cover = gallery[0];
  const isOpen = openIndex !== null;
  const close = () => setOpenIndex(null);
  const next = () => setOpenIndex((i) => (i + 1) % gallery.length);
  const prev = () => setOpenIndex((i) => (i - 1 + gallery.length) % gallery.length);

  return (
    <article>
      <div className={styles.banner}>
        <img src={cover.src} alt={cover.alt} />
        <div className={styles.bannerOverlay} />
        <div className={`container ${styles.bannerContent}`}>
          <Link to="/#imoveis" className={styles.backLink}>
            <LuArrowLeft /> Voltar aos imóveis
          </Link>
          <span
            className={`${styles.badge} ${
              property.dealType === "Aluguel" ? styles.badgeRent : styles.badgeSale
            }`}
          >
            {property.dealType}
          </span>
          <h1>{property.title}</h1>
          <p>
            {property.address.neighborhood} · {property.address.city}/{property.address.state}
          </p>
        </div>
      </div>

      {gallery.length > 1 && (
        <section className={`section ${styles.gallerysection}`}>
          <div className="container">
            <Reveal>
              <span className="eyebrow">Fotos</span>
              <h2 className="section-title">Conheça cada ambiente</h2>
            </Reveal>

            <div className={styles.galleryGrid}>
              {gallery.map((photo, i) => (
                <Reveal
                  key={photo.src}
                  delay={i * 0.06}
                  className={i === 0 ? styles.galleryBig : styles.gallerySmall}
                >
                  <button className={styles.galleryFrame} onClick={() => setOpenIndex(i)}>
                    <img src={photo.src} alt={photo.alt} loading="lazy" />
                    <span className={styles.galleryOverlay}>
                      <LuExpand />
                    </span>
                    {photo.caption && <span className={styles.galleryCaption}>{photo.caption}</span>}
                  </button>
                </Reveal>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                className={styles.lightbox}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={close}
              >
                <button className={styles.lbClose} onClick={close} aria-label="Fechar">
                  <LuX />
                </button>
                <button
                  className={`${styles.lbArrow} ${styles.lbArrowLeft}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label="Foto anterior"
                >
                  <LuChevronLeft />
                </button>
                <figure onClick={(e) => e.stopPropagation()}>
                  <motion.img
                    key={gallery[openIndex].src}
                    src={gallery[openIndex].src}
                    alt={gallery[openIndex].alt}
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                  {gallery[openIndex].caption && (
                    <figcaption>
                      {gallery[openIndex].caption} · {openIndex + 1}/{gallery.length}
                    </figcaption>
                  )}
                </figure>
                <button
                  className={`${styles.lbArrow} ${styles.lbArrowRight}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="Próxima foto"
                >
                  <LuChevronRight />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      <section className={`section ${styles.body}`}>
        <div className={`container ${styles.grid}`}>
          <Reveal className={styles.main}>
            <span className="eyebrow">Sobre o imóvel</span>
            <h2 className="section-title">Descrição</h2>
            {property.description.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className={styles.description}>
                {paragraph}
              </p>
            ))}

            <h3 className={styles.amenitiesTitle}>O que este imóvel oferece</h3>
            <ul className={styles.amenities}>
              {property.amenities.map((item) => (
                <li key={item}>
                  <LuCheck /> {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15} className={styles.sidebar}>
            <strong className={styles.price}>{formatBRL(property.price, property.dealType)}</strong>
            <p className={styles.priceLabel}>
              {property.dealType === "Aluguel" ? "Valor do aluguel mensal" : "Valor de venda"}
            </p>

            <div className={styles.specsGrid}>
              {property.specs.map((spec) => {
                const Icon = specIcons[spec.icon];
                return (
                  <div key={spec.label} className={styles.specBox}>
                    <Icon />
                    <div>
                      <strong>{spec.value}</strong>
                      <p>{spec.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <a
              href={`https://wa.me/${broker.whatsapp}?text=${encodeURIComponent(
                `Olá! Tenho interesse no imóvel "${property.title}" (${property.address.neighborhood}).`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <LuMessageCircle /> Falar sobre este imóvel
            </a>
            <a href={`tel:${broker.phone.replace(/\D/g, "")}`} className="btn btn-secondary">
              <LuPhone /> Ligar para {broker.name.split(" ")[0]}
            </a>
          </Reveal>
        </div>
      </section>

      {others.length > 0 && (
        <section className={`section ${styles.others}`}>
          <div className="container">
            <Reveal>
              <span className="eyebrow">Outros imóveis</span>
              <h2 className="section-title">Você também pode gostar</h2>
            </Reveal>
            <div className={styles.othersGrid}>
              {others.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.1}>
                  <Link to={`/imoveis/${p.id}`} className={styles.otherCard}>
                    <img src={p.gallery[0].src} alt={p.gallery[0].alt} loading="lazy" />
                    <div>
                      <span
                        className={`${styles.badge} ${
                          p.dealType === "Aluguel" ? styles.badgeRent : styles.badgeSale
                        }`}
                      >
                        {p.dealType}
                      </span>
                      <h3>{p.title}</h3>
                      <p>
                        {p.address.neighborhood} · {p.address.city}/{p.address.state}
                      </p>
                      <strong>{formatBRL(p.price, p.dealType)}</strong>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
