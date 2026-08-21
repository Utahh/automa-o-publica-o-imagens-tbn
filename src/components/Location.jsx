import { LuMapPin } from "react-icons/lu";
import { agency, serviceAreas } from "../data/property";
import Reveal from "./Reveal";
import styles from "./Location.module.css";

export default function Location() {
  const city = "Botucatu, SP";
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(city)}&output=embed`;

  return (
    <section id="localizacao" className={`section ${styles.location}`}>
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.text}>
          <span className="eyebrow">Onde atuamos</span>
          <h2 className="section-title">Imóveis em toda a região de {city.split(",")[0]}</h2>
          <p className="section-subtitle">
            A {agency.name} atua com casas, apartamentos e condomínios em diferentes bairros da
            cidade, sempre com atendimento pessoal do corretor responsável.
          </p>

          <div className={styles.addressCard}>
            <LuMapPin />
            <div>
              <strong>Atendimento em {city}</strong>
              <p>Visitas agendadas conforme sua disponibilidade</p>
            </div>
          </div>

          <ul className={styles.nearbyList}>
            {serviceAreas.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <strong>{item.distance}</strong>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15} className={styles.mapWrap}>
          <iframe
            title="Mapa da região de atuação"
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </div>
    </section>
  );
}
