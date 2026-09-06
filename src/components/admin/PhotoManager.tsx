import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { SafeImage } from "../SafeImage";
import { uploadToCloudinary } from "../../lib/cloudinaryUpload";

interface UploadingItem {
  key: string;
  name: string;
  progress: number;
}

/** Organiza as fotos do imóvel: a primeira da lista é sempre a capa.
 *  Reordena com botões (não arrastar) de propósito — HTML5 drag nativo
 *  não funciona em touch, e o corretor provavelmente cadastra pelo
 *  celular. */
export function PhotoManager({
  value,
  onChange,
  folder,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
}) {
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    for (const file of Array.from(files)) {
      const key = `${file.name}-${Date.now()}-${Math.random()}`;
      setUploading((u) => [...u, { key, name: file.name, progress: 0 }]);

      try {
        const url = await uploadToCloudinary(file, {
          folder,
          resourceType: "image",
          onProgress: (pct) => setUploading((u) => u.map((it) => (it.key === key ? { ...it, progress: pct } : it))),
        });
        onChange([...value, url]);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setUploading((u) => u.filter((it) => it.key !== key));
      }
    }
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function setCover(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [chosen] = next.splice(index, 1);
    next.unshift(chosen);
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((url, i) => (
          <div key={url} className="group relative overflow-hidden rounded-xl ring-1 ring-grafite/10">
            <SafeImage src={url} alt="" wrapperClassName="aspect-[4/3]" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-azul-escritura px-2.5 py-1 font-mono text-[10px] font-medium tracking-wide text-cinza-papel">
                Capa
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-0.5 bg-grafite-noite/85 px-1.5 py-1.5 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Mover foto pra esquerda"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-cinza-papel disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCover(i)}
                disabled={i === 0}
                aria-label="Definir como capa"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-cinza-papel disabled:opacity-30"
              >
                <Star className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remover foto"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-cinza-papel"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                aria-label="Mover foto pra direita"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-cinza-papel disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {uploading.map((item) => (
          <div
            key={item.key}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-grafite/20 text-grafite-muted"
          >
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
            <span aria-live="polite" className="font-mono text-[11px]">
              {item.progress}%
            </span>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-grafite/25 text-grafite-muted transition-colors hover:border-azul-escritura hover:text-azul-escritura"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="font-display text-[12.5px] font-medium">Adicionar fotos</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        name="photos"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error && (
        <p aria-live="polite" className="mt-2 font-display text-[13px] text-amber-700">
          {error}
        </p>
      )}
      <p className="mt-2 font-display text-[12px] text-grafite-muted">
        Até 15 MB por foto. A primeira da lista aparece na home e na listagem de imóveis.
      </p>
    </div>
  );
}
