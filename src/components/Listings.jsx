import { Link } from "react-router-dom";
import { LuBedDouble, LuBath, LuCar, LuRuler, LuArrowRight, LuImages } from "react-icons/lu";
import { useProperties, broker } from "../data/property";
import Reveal from "./Reveal";
import styles from "./Listings.module.css";

const formatBRL = (value, dealType) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    value
  ) + (dealType === "Aluguel" ? "/mês" : "");

export default function Listings() {
  const { properties, loading } = useProperties();

  return (
    <section id="imoveis" className={`section ${styles.listings}`}>
      <div className="container">
        <Reveal>
          <span className="eyebrow">Imóveis disponíveis</span>
          <h2 className="section-title">Cada imóvel é um imóvel diferente</h2>
          <p className="section-subtitle">
            Casas e apartamentos selecionados pessoalmente por {broker.name.split(" ")[0]}. Clique
            em um imóvel para ver todos os detalhes.
          </p>
        </Reveal>

        {loading && (
          <div className={styles.loadingState}>
            <span className={styles.loadingDot} />
            <span className={styles.loadingDot} />
            <span className={styles.loadingDot} />
          </div>
        )}

        {!loading && properties.length === 0 && (
          <p className={styles.emptyState}>Nenhum imóvel disponível no momento.</p>
        )}

        {!loading && (
          <div className={styles.grid}>
            {properties.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1} className={styles.cardWrap}>
                <Link to={`/imoveis/${p.id}`} className={styles.card}>
                  <div className={styles.imageBtn}>
                    <img src={p.gallery[0].src} alt={p.gallery[0].alt} loading="lazy" />
                    <span
                      className={`${styles.dealBadge} ${
                        p.dealType === "Aluguel" ? styles.badgeRent : styles.badgeSale
                      }`}
                    >
                      {p.dealType}
                    </span>
                    {p.gallery.length > 1 && (
                      <span className={styles.photoCount}>
                        <LuImages /> {p.gallery.length}
                      </span>
                    )}
                  </div>

                  <div className={styles.cardBody}>
                    <h3>{p.title}</h3>
                    <p className={styles.location}>
                      {p.address.neighborhood} · {p.address.city}/{p.address.state}
                    </p>

                    <div className={styles.specsMini}>
                      {p.specs[0] && <span><LuBedDouble /> {p.specs[0].value}</span>}
                      {p.specs[1] && <span><LuBath /> {p.specs[1].value}</span>}
                      {p.specs[2] && <span><LuCar /> {p.specs[2].value}</span>}
                      {p.specs[3] && <span><LuRuler /> {p.specs[3].value}</span>}
                    </div>

                    <div className={styles.cardFooter}>
                      <strong>{formatBRL(p.price, p.dealType)}</strong>
                      <span className={styles.detailsLink}>
                        Ver detalhes <LuArrowRight />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
