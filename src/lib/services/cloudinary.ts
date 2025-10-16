// lib/services/cloudinary.ts

// Declaraciones de tipos para las variables de entorno
declare global {
  interface Window {
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_UPLOAD_PRESET?: string;
    CLOUDINARY_API_KEY?: string;
  }
}

// Usar process.env para Next.js
const CLOUDINARY_CLOUD_NAME =
  process.env.VITE_CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  (typeof window !== 'undefined' ? window.CLOUDINARY_CLOUD_NAME : undefined) ||
  "dpuhe3wqk"; // Fallback con las credenciales proporcionadas

const CLOUDINARY_UPLOAD_PRESET =
  process.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
  (typeof window !== 'undefined' ? window.CLOUDINARY_UPLOAD_PRESET : undefined) ||
  "unsigned_receipts"; // Fallback con las credenciales proporcionadas

const CLOUDINARY_API_KEY =
  process.env.VITE_CLOUDINARY_API_KEY ||
  process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
  (typeof window !== 'undefined' ? window.CLOUDINARY_API_KEY : undefined) ||
  "382432513775314"; // Fallback con las credenciales proporcionadas

function ensureConfig() {
  const missing = [];
  if (!CLOUDINARY_CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!CLOUDINARY_UPLOAD_PRESET) missing.push("CLOUDINARY_UPLOAD_PRESET");
  if (!CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
  if (missing.length) {
    throw new Error(`Faltan configuraciones de Cloudinary: ${missing.join(", ")}`);
  }
}

export async function uploadImageToCloudinary(file: File) {
  ensureConfig();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || "No se pudo subir la imagen a Cloudinary");
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    bytes: data.bytes,
  };
}
