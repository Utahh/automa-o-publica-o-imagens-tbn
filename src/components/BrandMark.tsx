import logoHorizontal from "../assets/brand/logotipo-horizontal.svg";
import logoHorizontalNegativo from "../assets/brand/logotipo-horizontal-negativo.svg";
import simbolo from "../assets/brand/simbolo.svg";
import simboloNegativo from "../assets/brand/simbolo-negativo.svg";

interface BrandMarkProps {
  variant?: "default" | "negativo";
  mode?: "wordmark" | "symbol";
  className?: string;
}

const sources = {
  wordmark: { default: logoHorizontal, negativo: logoHorizontalNegativo },
  symbol: { default: simbolo, negativo: simboloNegativo },
};

export function BrandMark({ variant = "default", mode = "wordmark", className }: BrandMarkProps) {
  return (
    <img
      src={sources[mode][variant]}
      alt="Toninho Bomnome, corretor de imóveis"
      className={className}
      draggable={false}
    />
  );
}
