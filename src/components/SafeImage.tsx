import { useState, type ImgHTMLAttributes } from "react";
import clsx from "clsx";

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

/** <img> com respaldo visual da marca caso a foto não carregue. */
export function SafeImage({ wrapperClassName, className, alt, ...props }: SafeImageProps) {
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
      loading="lazy"
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
