import { useState } from "react";
import { LuSend, LuPhone } from "react-icons/lu";
import { broker } from "../data/property";
import Reveal from "./Reveal";
import styles from "./ContactCTA.module.css";

export default function ContactCTA() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `Olá, meu nome é ${form.name || "—"}.\nTelefone: ${form.phone || "—"}\nGostaria de saber mais sobre os imóveis da TBN Imóveis.\n${form.message ? `Mensagem: ${form.message}` : ""}`;
    window.open(`https://wa.me/${broker.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section id="contato" className={`section ${styles.contact}`}>
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.text}>
          <span className="eyebrow">Fale com a gente</span>
          <h2 className="section-title">Vamos agendar sua visita?</h2>
          <p className="section-subtitle">
            Preencha seus dados e {broker.name.split(" ")[0]} entra em contato para combinar o
            melhor horário, ou chame direto no WhatsApp.
          </p>

          <div className={styles.directRow}>
            <a
              href={`https://wa.me/${broker.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <LuSend /> WhatsApp direto
            </a>
            <a href={`tel:${broker.phone.replace(/\D/g, "")}`} className="btn btn-outline">
              <LuPhone /> {broker.phone}
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.15} className={styles.form} y={24}>
          <form onSubmit={handleSubmit} className={styles.formInner}>
            <label>
              Nome
              <input
                type="text"
                name="name"
                placeholder="Seu nome completo"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Telefone
              <input
                type="tel"
                name="phone"
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Mensagem (opcional)
              <textarea
                name="message"
                placeholder="Quero agendar uma visita neste fim de semana..."
                rows={3}
                value={form.message}
                onChange={handleChange}
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Enviar via WhatsApp
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
