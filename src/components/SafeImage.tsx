import { useState, type ImgHTMLAttributes } from "react";
import clsx from "clsx";
import { imageSrcSet, optimizeImage } from "../lib/cloudinary";

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  /** Largura exibida em px: ativa o redimensionamento das fotos do Cloudinary. */
  displayWidth?: number;
}

/** <img> com respaldo visual da marca caso a foto não carregue. */
export function SafeImage({ wrapperClassName, className, alt, displayWidth, src, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center bg-grafite text-cinza-papel/30",
          wrapperClassName,
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <svg viewBox="0 0 120 120" className="h-[38%] w-[38%]" aria-hidden="true">
          <rect x="8" y="8" width="55.15" height="39.18" fill="currentColor" opacity="0.5" />
          <rect x="71.15" y="8" width="40.85" height="39.18" fill="currentColor" opacity="0.5" />
          <rect x="8" y="55.18" width="55.15" height="56.82" fill="currentColor" />
          <rect x="71.15" y="55.18" width="40.85" height="56.82" fill="currentColor" opacity="0.5" />
          <rect x="28.8" y="112" width="36" height="8" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    );
  }

  return (
    <img
      className={className}
      alt={alt}
      src={src && displayWidth ? optimizeImage(src, displayWidth * 2) : src}
      srcSet={src && displayWidth ? imageSrcSet(src, displayWidth) : undefined}
      sizes={src && displayWidth ? `${displayWidth}px` : undefined}
      loading="lazy"
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
