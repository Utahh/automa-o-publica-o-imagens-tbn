import { useRef, useState } from "react";
import { Loader2, Trash2, Video } from "lucide-react";
import { MAX_VIDEO_SIZE_MB, uploadToCloudinary } from "../../lib/cloudinaryUpload";

/** Vídeo do imóvel — opcional. Upload de arquivo direto pro Cloudinary,
 *  com teto de tamanho pra não estourar a cota gratuita. */
export function VideoUploader({
  value,
  onChange,
  folder,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      const url = await uploadToCloudinary(file, { folder, resourceType: "video", onProgress: setProgress });
      onChange(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProgress(null);
    }
  }

  if (value) {
    return (
      <div className="overflow-hidden rounded-xl ring-1 ring-grafite/10">
        <video src={value} controls className="aspect-video w-full bg-grafite" />
        <div className="flex items-center justify-between bg-white px-4 py-2.5">
          <span className="font-display text-[13px] text-grafite-muted">Vídeo enviado</span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center gap-1.5 font-display text-[13px] font-medium text-amber-700"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={progress !== null}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-grafite/25 py-8 text-grafite-muted transition-colors hover:border-azul-escritura hover:text-azul-escritura"
      >
        {progress !== null ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-mono text-[12px]">{progress}%</span>
          </>
        ) : (
          <>
            <Video className="h-5 w-5" />
            <span className="font-display text-[13px] font-medium">Adicionar vídeo (opcional)</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-2 font-display text-[13px] text-amber-700">{error}</p>}
      <p className="mt-2 font-display text-[12px] text-grafite-muted">Até {MAX_VIDEO_SIZE_MB} MB.</p>
    </div>
  );
}
