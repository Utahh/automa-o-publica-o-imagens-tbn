// Upload direto do navegador pro Cloudinary via unsigned upload preset —
// substitui o que o pipeline antigo fazia com sharp no servidor (o preset
// já é configurado, no Dashboard do Cloudinary, com limite de largura/
// qualidade pras fotos). Isso evita rotear bytes de imagem/vídeo pela
// função serverless (limite de payload do Vercel) e mantém a API secret
// só no servidor — o preset e o cloud name não são segredo.
export const MAX_PHOTO_SIZE_MB = 15;
export const MAX_VIDEO_SIZE_MB = 100;

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

interface UploadOptions {
  folder: string;
  resourceType: "image" | "video";
  onProgress?: (percent: number) => void;
}

export function uploadToCloudinary(file: File, { folder, resourceType, onProgress }: UploadOptions): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return Promise.reject(
      new Error("Upload não configurado — faltam VITE_CLOUDINARY_CLOUD_NAME/VITE_CLOUDINARY_UPLOAD_PRESET.")
    );
  }

  const maxMb = resourceType === "video" ? MAX_VIDEO_SIZE_MB : MAX_PHOTO_SIZE_MB;
  if (file.size > maxMb * 1024 * 1024) {
    return Promise.reject(new Error(`Arquivo grande demais (máx. ${maxMb} MB).`));
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText).secure_url as string);
        } catch {
          reject(new Error("Resposta inesperada do Cloudinary."));
        }
      } else {
        reject(new Error("Falha no upload — tente de novo."));
      }
    };
    xhr.onerror = () => reject(new Error("Falha de conexão durante o upload."));
    xhr.send(formData);
  });
}
