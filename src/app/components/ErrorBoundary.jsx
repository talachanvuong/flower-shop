"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function SupabaseGuard({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function check() {
      try {
        const { error } = await supabase.from("wishes").select("id").limit(1);
        setStatus(error ? "error" : "ok");
      } catch {
        setStatus("error");
      }
    }
    check();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="w-8 h-8 border-2 border-pink-300 rounded-full border-t-pink-500 animate-spin" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center flex-1 px-4">
        <div className="max-w-sm text-center">
          <div className="mb-4 text-5xl">🌸</div>
          <p className="mb-2 text-lg font-semibold text-pink-500">Không thể kết nối</p>
          <p className="mb-6 text-sm text-gray-500">Hệ thống đang tạm thời gián đoạn. Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
          <button type="button" onClick={() => window.location.reload()} className="px-6 py-2 text-sm font-medium text-white bg-pink-500 rounded-full cursor-pointer hover:bg-pink-600">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return children;
}
