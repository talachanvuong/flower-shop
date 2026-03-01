"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

function WishCard({ wish, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setDeleting(true);
    try {
      // Xóa ảnh trong storage
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
        const { error: storageError } = await supabase.storage.from("wish-images").remove(cleanPaths);
      }

      // Xóa row
      await supabase.from("wishes").delete().eq("id", wish.id);
      onDelete(wish.id);
    } catch (err) {
      console.error(err);
      setDeleting(false);
      setConfirm(false);
    }
  }

  const createdAt = new Date(wish.created_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const wishUrl = wish.link || wish.id;
  const templateLabel = wish.template === "polaroid" ? "Polaroid & Thư" : "Thiệp Trái Tim";
  const templateIcon = wish.template === "polaroid" ? "📸" : "💌";

  // Thumbnail — ảnh đầu tiên
  function getThumbnail() {
    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wish-images/`;
    if (wish.template === "polaroid" && wish.data.photo1) return base + wish.data.photo1;
    if (wish.template === "heart" && wish.data.heartPhotos?.[0]) return base + wish.data.heartPhotos[0];
    return null;
  }

  const thumbnail = getThumbnail();

  return (
    <div className="flex gap-4 p-4 transition-shadow bg-white border border-pink-100 shadow-sm rounded-2xl hover:shadow-md">
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
        <button type="button" onClick={handleDelete} disabled={deleting} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${confirm ? "bg-red-500 text-white border-red-500 hover:bg-red-600" : "text-red-400 border-red-200 hover:bg-red-50"} ${deleting ? "opacity-50 cursor-not-allowed" : ""}`}>
          {deleting ? "..." : confirm ? "Chắc chắn?" : "Xóa"}
        </button>
      </div>
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
