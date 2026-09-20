const UPLOAD_MARKER = "/image/upload/";

/**
 * Pede ao Cloudinary a foto já redimensionada, em WebP/AVIF e com qualidade
 * automática. URLs que não são do Cloudinary (ou que já têm transformação)
 * passam intactas.
 */
export function optimizeImage(url: string, width: number): string {
  if (!url.includes("res.cloudinary.com") || !url.includes(UPLOAD_MARKER)) return url;
  const [head, tail] = url.split(UPLOAD_MARKER);
  // tail começa com a versão (v123...) quando não há transformação.
  if (!/^v\d+\//.test(tail)) return url;
  return `${head}${UPLOAD_MARKER}f_auto,q_auto,c_limit,w_${width}/${tail}`;
}

/** srcset 1x/2x a partir da largura exibida (px). */
export function imageSrcSet(url: string, width: number): string | undefined {
  const optimized = optimizeImage(url, width);
  if (optimized === url) return undefined;
  return `${optimized} ${width}w, ${optimizeImage(url, width * 2)} ${width * 2}w`;
}
