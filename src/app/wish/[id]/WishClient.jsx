"use client";

import { PolaroidDisplay, HeartDisplay, PRESET_GIFS_LEFT, PRESET_GIFS_RIGHT } from "@/app/components/WishDisplay";

export default function WishClient({ wish }) {
  const { template, message, data } = wish;

  // Resolve GIF src từ id
  const gifTLSrc = data.gifTLSrc || [...PRESET_GIFS_LEFT, ...PRESET_GIFS_RIGHT].find((g) => g.id === data.gifTL)?.src;
  const gifBRSrc = data.gifBRSrc || [...PRESET_GIFS_LEFT, ...PRESET_GIFS_RIGHT].find((g) => g.id === data.gifBR)?.src;

  // Resolve public URL ảnh từ Supabase storage
  function getUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wish-images/${path}`;
  }

  return (
    <div className="flex items-center justify-center flex-1">
      <div
        className="w-full"
        style={{
          maxWidth: "min(480px, 65vh)",
        }}
      >
        {template === "polaroid" && <PolaroidDisplay message={message} photo1={getUrl(data.photo1)} photo2={getUrl(data.photo2)} gifTL={gifTLSrc} gifBR={gifBRSrc} />}
        {template === "heart" && <HeartDisplay message={message} heartTitle={data.heartTitle} heartPhotos={(data.heartPhotos || []).map(getUrl)} />}
      </div>
    </div>
  );
}
