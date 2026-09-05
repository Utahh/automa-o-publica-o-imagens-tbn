import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Gallery } from "../components/Gallery";
import { SpecRow } from "../components/SpecRow";
import { LocationCard } from "../components/LocationCard";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { PropertyCard } from "../components/PropertyCard";
import { Reveal } from "../components/Reveal";
import { BrandMark } from "../components/BrandMark";
import { getPropertyBySlug, getRelatedProperties } from "../data/properties";
import { useProperties } from "../hooks/useProperties";
import { formatPrice } from "../lib/format";
import { agent } from "../data/agent";

export function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { properties, loading } = useProperties();
  const property = slug ? getPropertyBySlug(properties, slug) : undefined;

  if (!property) {
    if (loading) return null;
    return <Navigate to="/imoveis" replace />;
  }

  const related = getRelatedProperties(properties, property);
  const whatsappMessage = `Olá, Toninho! Tenho interesse no imóvel "${property.title}" (${property.neighborhood}, ${property.city}). Podemos conversar?`;

  return (
    <div className="min-h-screen bg-cinza-papel pb-24 pt-24 md:pb-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal y={12}>
          <Link
            to="/imoveis"
            className="inline-flex items-center gap-1.5 font-display text-sm font-medium text-grafite-muted transition-colors hover:text-azul-escritura"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
            Voltar para imóveis
          </Link>
        </Reveal>

        <div className="mt-5 grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          <div className="min-w-0">
            <Reveal y={16}>
              <Gallery images={property.gallery} alt={property.title} />
            </Reveal>

            <Reveal y={16} delay={0.08} className="mt-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-azul-escritura/10 px-3 py-1 font-mono text-[11px] font-medium tracking-wide text-azul-escritura">
                    {property.type} · {property.dealType}
                  </span>
                  {property.status !== "Disponível" && (
                    <span className="ml-2 rounded-full bg-grafite/10 px-3 py-1 font-mono text-[11px] font-medium tracking-wide text-grafite">
                      {property.status}
                    </span>
                  )}
                  <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-grafite sm:text-3xl">
                    {property.title}
                  </h1>
                  <p className="mt-1.5 font-display text-[15px] text-grafite-muted">
                    {property.neighborhood}, {property.city} · {property.state}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-grafite-muted/70">Código {property.code}</p>
                </div>
                <p className="font-mono-tabular font-mono text-2xl font-semibold text-azul-escritura sm:text-3xl">
                  {formatPrice(property.price, property.dealType)}
                </p>
              </div>

              <SpecRow property={property} className="mt-6 border-y border-grafite/8 py-5" />

              <div className="mt-6 space-y-4">
                {property.description.map((paragraph, i) => (
                  <p key={i} className="font-display text-[15px] leading-relaxed text-grafite">
                    {paragraph}
                  </p>
                ))}
              </div>

              {property.video && (
                <div className="mt-8">
                  <h2 className="font-display text-lg font-semibold text-grafite">Vídeo do imóvel</h2>
                  <video
                    src={property.video}
                    controls
                    className="mt-3 aspect-video w-full rounded-2xl bg-grafite"
                  />
                </div>
              )}
            </Reveal>
          </div>

          <Reveal y={16} delay={0.12} className="space-y-6">
            <div className="rounded-2xl border border-grafite/8 bg-white p-6">
              <div className="flex items-center gap-3">
                <BrandMark mode="symbol" className="h-11 w-11" />
                <div>
                  <p className="font-display text-sm font-semibold text-grafite">{agent.name}</p>
                  <p className="font-mono text-[11px] text-grafite-muted">{agent.creci}</p>
                </div>
              </div>
              <p className="mt-4 font-display text-[13.5px] leading-relaxed text-grafite-muted">
                Quer visitar ou tirar uma dúvida sobre esse imóvel? Fale direto comigo.
              </p>
              <WhatsAppButton message={whatsappMessage} className="mt-5 w-full justify-center" />
              <a
                href={`tel:+55${agent.whatsappNumber.slice(2)}`}
                className="mt-3 block text-center font-mono text-sm text-grafite-muted transition-colors hover:text-azul-escritura"
              >
                {agent.phone}
              </a>
            </div>

            <LocationCard property={property} />
          </Reveal>
        </div>

        {related.length > 0 && (
          <div className="mt-20 border-t border-grafite/8 pt-14">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-grafite">
                Pode te interessar também
              </h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
