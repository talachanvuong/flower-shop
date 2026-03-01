"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

function WishCard({ wish, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const wishUrl = wish.link || wish.id;
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/wish/${wishUrl}` : `/wish/${wishUrl}`;
  const templateLabel = wish.template === "polaroid" ? "Polaroid & Thư" : "Thiệp Trái Tim";
  const templateIcon = wish.template === "polaroid" ? "📸" : "💌";

  const createdAt = new Date(wish.created_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  function getThumbnail() {
    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wish-images/`;
    if (wish.template === "polaroid" && wish.data.photo1) return base + wish.data.photo1;
    if (wish.template === "heart" && wish.data.heartPhotos?.[0]) return base + wish.data.heartPhotos[0];
    return null;
  }

  const thumbnail = getThumbnail();

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setDeleting(true);
    try {
      const paths = [];
      if (wish.template === "polaroid") {
        if (wish.data.photo1) paths.push(wish.data.photo1);
        if (wish.data.photo2) paths.push(wish.data.photo2);
      }
      if (wish.template === "heart") {
        (wish.data.heartPhotos || []).forEach((p) => p && paths.push(p));
      }

      if (paths.length > 0) {
        const cleanPaths = paths.map((p) => (p.startsWith("wish-images/") ? p.replace("wish-images/", "") : p));
        await supabase.storage.from("wish-images").remove(cleanPaths);
      }

      const { error: dbError } = await supabase.from("wishes").delete().eq("id", wish.id);
      if (dbError) throw dbError;

      onDelete(wish.id);
    } catch (err) {
      console.error("Delete error:", err);
      setDeleting(false);
      setConfirm(false);
    }
  }

  function handleDownloadQR() {
    const svg = document.getElementById(`qr-${wish.id}`);
    if (!svg) return;

    const size = 400;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `wish-${wishUrl}.png`;
        a.click();
      }, "image/png");
    };
    img.src = url;
  }

  return (
    <div className="overflow-hidden transition-shadow bg-white border border-pink-100 shadow-sm rounded-2xl hover:shadow-md">
      {/* Main row */}
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-pink-100 rounded-xl shrink-0">{thumbnail ? <img src={thumbnail} alt="" className="object-cover w-full h-full" /> : <span className="text-2xl">{templateIcon}</span>}</div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">{templateLabel}</span>
            <span className="text-xs text-gray-400">{createdAt}</span>
          </div>
          <p className="mb-1 text-sm text-gray-700 truncate">{wish.message}</p>
          <Link href={`/wish/${wishUrl}`} target="_blank" className="block text-xs text-pink-400 truncate hover:text-pink-600">
            /wish/{wishUrl}
          </Link>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          <Link href={`/wish/${wishUrl}`} target="_blank" className="px-3 py-1.5 text-xs font-medium text-pink-500 border border-pink-200 rounded-full hover:bg-pink-50 text-center">
            Xem
          </Link>
          <button type="button" onClick={() => setShowQR((v) => !v)} className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${showQR ? "bg-pink-500 text-white border-pink-500" : "text-pink-500 border-pink-200 hover:bg-pink-50"}`}>
            QR
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${confirm ? "bg-red-500 text-white border-red-500 hover:bg-red-600" : "text-red-400 border-red-200 hover:bg-red-50"} ${deleting ? "opacity-50 cursor-not-allowed" : ""}`}>
            {deleting ? "..." : confirm ? "Chắc chắn?" : "Xóa"}
          </button>
        </div>
      </div>

      {/* QR Panel */}
      {showQR && (
        <div className="flex flex-col items-center gap-5 px-4 py-5 border-t border-pink-100 sm:flex-row bg-pink-50">
          <div className="p-3 bg-white shadow-sm rounded-2xl shrink-0">
            <QRCodeSVG id={`qr-${wish.id}`} value={fullUrl} size={140} bgColor="#ffffff" fgColor="#be185d" level="M" />
          </div>
          <div className="flex flex-col w-full min-w-0 gap-2">
            <p className="text-xs font-medium text-gray-500">Đường dẫn</p>
            <p className="text-xs text-gray-700 break-all">{fullUrl}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <button type="button" onClick={() => navigator.clipboard.writeText(fullUrl)} className="px-4 py-1.5 text-xs font-medium text-pink-500 border border-pink-200 rounded-full hover:bg-pink-100">
                Sao chép link
              </button>
              <button type="button" onClick={handleDownloadQR} className="px-4 py-1.5 text-xs font-medium text-white bg-pink-500 rounded-full hover:bg-pink-600">
                Tải QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManagePage() {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishes() {
      const { data, error } = await supabase.from("wishes").select("*").order("created_at", { ascending: false });

      if (!error) setWishes(data || []);
      setLoading(false);
    }
    fetchWishes();
  }, []);

  function handleDelete(id) {
    setWishes((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div className="flex-1 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <p className="text-2xl font-semibold text-pink-500 sm:text-3xl">Quản lý lời chúc</p>
        <Link href="/create" className="px-5 py-2 text-sm font-medium text-white bg-pink-500 rounded-full hover:bg-pink-600">
          Tạo mới
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-pink-300 rounded-full border-t-pink-500 animate-spin" />
        </div>
      )}

      {!loading && wishes.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <span className="text-5xl">💌</span>
          <p className="text-gray-400">Chưa có lời chúc nào.</p>
          <Link href="/create" className="text-sm text-pink-500 hover:underline">
            Tạo lời chúc đầu tiên
          </Link>
        </div>
      )}

      {!loading && wishes.length > 0 && (
        <div className="flex flex-col gap-3">
          {wishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
