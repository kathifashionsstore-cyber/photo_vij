const DEFAULT_IMGBB_KEY = "106aa1744e58f8a5770cb8b1dee136ad";

export const IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY || DEFAULT_IMGBB_KEY;

const canvasToBlob = (canvas, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

const drawToCanvas = async (file, maxSide) => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas;
};

export const compressImageToTarget = async (file, targetKb = 300) => {
  const targetBytes = targetKb * 1024;
  let maxSide = 1800;
  let canvas = await drawToCanvas(file, maxSide);
  let quality = 0.84;
  let blob = await canvasToBlob(canvas, quality);

  while (blob && blob.size > targetBytes && maxSide > 900) {
    quality = Math.max(0.5, quality - 0.08);
    blob = await canvasToBlob(canvas, quality);
    if (blob && blob.size <= targetBytes) break;
    maxSide = Math.round(maxSide * 0.86);
    canvas = await drawToCanvas(file, maxSide);
  }

  while (blob && blob.size > targetBytes && quality > 0.36) {
    quality -= 0.06;
    blob = await canvasToBlob(canvas, quality);
  }

  const safeName = file.name.replace(/\.[^.]+$/, "") || "snaplica-photo";
  return new File([blob || file], `${safeName}.jpg`, { type: "image/jpeg" });
};

export const uploadToImgBB = async (file) => {
  const data = new FormData();
  data.append("image", file);
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: "POST",
    body: data,
  });
  const json = await response.json();
  if (!json.success) throw new Error(json?.error?.message || "ImgBB upload failed");
  return json.data;
};

export const compressAndUploadImage = async (file, onStatus) => {
  onStatus?.("compressing");
  const compressedFile = await compressImageToTarget(file, 300);
  onStatus?.("uploading");
  const uploaded = await uploadToImgBB(compressedFile);
  onStatus?.("saved");
  return { compressedFile, uploaded };
};
