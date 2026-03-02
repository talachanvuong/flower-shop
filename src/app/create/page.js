"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import { useRef, useState } from "react";
import MusicPicker from "@/app/components/MusicPicker";

const PRESET_GIFS_LEFT = [
  { id: "l1", label: "Left 1", src: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXVtNTQ2NHdtc3cyYWZ0OXQyNmJkaWl4NDY2NzZuaG0yOXEwZTN1ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/I5r4ErmOa63wAy9spl/giphy.gif" },
  { id: "l2", label: "Left 2", src: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWxxenExbW55YTd0ZHhhcHZpYWE3dGtiOTI4dzNnM3ZmM3dpNGV5MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/euW6JDwrMn0BqyNC8t/giphy.gif" },
  { id: "l3", label: "Left 3", src: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExanYwaThzdDdhdmhucTBuYjlueXc5NmM1bzM0YmR3YWpkbXByeW02dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/VM1fcpu2bKs1e2Kdbj/giphy.gif" },
  { id: "l4", label: "Left 4", src: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjJrN2N4dzVtczd1a2ppeTdraW5uNzcwNXM5Y2IyODBqdTB3c2poNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/XFnttoh4gJzhLEHzf2/giphy.gif" },
  { id: "l5", label: "Left 5", src: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW9weHNubW1tcTN3ZjNtMzg1MzMwMTB4YjBsZG44cDE4NzBzZWt4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/32sJEBHafCBjfHCt67/giphy.gif" },
];

const PRESET_GIFS_RIGHT = [
  { id: "r1", label: "Right 1", src: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmZwbWw5bjdmaHN1djA3MDRqN2lhbHVoMG1rM203YTBjMTRsano0bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Oj5MkUfa9yOSA/giphy.gif" },
  { id: "r2", label: "Right 2", src: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3h5NnhpMzd3bHN1OHN6ZnBwNHI3cW55Y2Z5MXMwZmxmam5iOXB3eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Urf2Tyvtq3yyYwthM3/giphy.gif" },
  { id: "r3", label: "Right 3", src: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDduZnc3dDYydWV5d3hlMW9ndXA0bXo0MGw3dTlkOWNjcGpzdDJ1MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/1hoKkBNSBxVyHIsPer/giphy.gif" },
  { id: "r4", label: "Right 4", src: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnN5bWRwcDZscjNpbTdrY2dnZGpncnQ4bW40ODJmbWh4N3A5d2x4dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/aA2YfDOirPs1439Sy0/giphy.gif" },
  { id: "r5", label: "Right 5", src: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnB1ajhlZzZodnprOHpvcjIxNWlkbTU4dzNhOGM2Yjl5Ynd1eWhiMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/uJBS8UxetPSC1joSfA/giphy.gif" },
];

const MAX_MESSAGE = 300;
const MAX_MESSAGE_HEART = 80;
const MAX_URL = 64;

// ─── Image Compression ────────────────────────────────────────

async function compressImage(file) {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.07, // tối đa 70KB
    maxWidthOrHeight: 1080, // giới hạn resolution
    useWebWorker: true, // không block UI
    fileType: "image/jpeg",
  });
  return URL.createObjectURL(compressed);
}

async function uploadImage(dataUrlOrBlob, filename) {
  let blob;
  if (typeof dataUrlOrBlob === "string") {
    const res = await fetch(dataUrlOrBlob);
    blob = await res.blob();
  } else {
    blob = dataUrlOrBlob;
  }

  const { data, error } = await supabase.storage.from("wish-images").upload(filename, blob, { contentType: "image/jpeg", upsert: false });

  if (error) throw error;
  // Chỉ lưu phần path trong bucket, bỏ prefix nếu có
  return data.path.replace("wish-images/", "");
}

// ─── ImagePicker ─────────────────────────────────────────────

function ImagePicker({ value, onChange, label }) {
  const inputRef = useRef(null);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    onChange(compressed);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <label className="flex flex-col items-center justify-center w-full gap-1 overflow-hidden bg-white border-2 border-pink-200 border-dashed cursor-pointer h-28 rounded-xl hover:border-pink-400">
        {value ? <img src={value} alt="" className="object-cover w-full h-full" /> : <span className="text-xs text-gray-400">Tải ảnh lên</span>}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
    </div>
  );
}

// ─── GifPicker ───────────────────────────────────────────────

function GifPicker({ value, onChange, label, presets }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState("preset");
  const debounceRef = useRef(null);

  async function searchGifs(q) {
    if (!q.trim()) {
      setResults([]);
      setMode("preset");
      return;
    }
    setSearching(true);
    setMode("search");
    try {
      const res = await fetch(`https://api.giphy.com/v1/stickers/search?q=${encodeURIComponent(q)}&api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&limit=50&rating=g`);
      const data = await res.json();

      if (res.status === 429) {
        setResults([]);
        setMode("ratelimit");
        return;
      }

      if (!res.ok) {
        setResults([]);
        setMode("error");
        return;
      }

      const gifs = (data.data || []).map((r) => ({
        id: r.id,
        src: r.images?.fixed_width_small?.url || r.images?.downsized?.url,
        label: r.title || r.id,
      }));
      setResults(gifs);
    } catch {
      setResults([]);
      setMode("error");
    } finally {
      setSearching(false);
    }
  }

  function handleInput(e) {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setMode("preset");
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => searchGifs(q), 500);
  }

  const displayList = mode === "search" ? results : presets;

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}

      <input type="text" value={query} onChange={handleInput} placeholder="Tìm sticker..." className="w-full px-3 py-1.5 text-xs bg-white border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />

      <div className="relative min-h-16">
        {searching && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin" />
          </div>
        )}

        {!searching && mode === "ratelimit" && <p className="text-xs text-center text-amber-500 py-3">Đã đạt giới hạn tìm kiếm, vui lòng thử lại sau ít phút.</p>}

        {!searching && mode === "error" && <p className="text-xs text-center text-red-400 py-3">Không thể tải sticker, vui lòng thử lại.</p>}

        {!searching && mode === "search" && results.length === 0 && <p className="text-xs text-center text-gray-400 py-3">Không tìm thấy kết quả</p>}

        {!searching && (
          <div className="flex flex-wrap gap-1.5">
            {displayList.map((g) => (
              <button key={g.id} type="button" onClick={() => onChange(g)} className={`cursor-pointer overflow-hidden rounded-lg border-2 w-12 h-12 bg-pink-50 shrink-0 ${value?.id === g.id ? "border-pink-500" : "border-transparent hover:border-pink-300"}`}>
                {g.src && <img src={g.src} alt={g.label || ""} className="object-cover w-full h-full" />}
              </button>
            ))}
          </div>
        )}

        {mode === "search" && results.length > 0 && (
          <p className="mt-1 text-right text-gray-300" style={{ fontSize: "0.6rem" }}>
            via GIPHY
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Heart Grid ───────────────────────────────────────────────

const ROW_CONFIGS = [
  {
    rowW: "60%",
    justify: "space-between",
    cells: [
      { w: "44%", aspect: "16 / 9" },
      { w: "44%", aspect: "16 / 9" },
    ],
  },
  {
    rowW: "80%",
    justify: "center",
    gap: "2%",
    cells: [
      { w: "25%", aspect: "1 / 1" },
      { w: "50%", aspect: "16 / 9" },
      { w: "25%", aspect: "1 / 1" },
    ],
  },
  {
    rowW: "46%",
    justify: "center",
    gap: "2%",
    cells: [
      { w: "46%", aspect: "16 / 9" },
      { w: "46%", aspect: "16 / 9" },
      { w: "46%", aspect: "16 / 9" },
    ],
  },
  {
    rowW: "46%",
    justify: "center",
    gap: "4%",
    cells: [
      { w: "46%", aspect: "16 / 9" },
      { w: "46%", aspect: "16 / 9" },
    ],
  },
  {
    rowW: "12%",
    justify: "center",
    cells: [{ w: "100%", aspect: "1 / 1" }],
  },
];

function HeartGrid({ photos, onUpload }) {
  let idx = 0;
  return (
    <div className="flex flex-col items-center w-full" style={{ gap: "1.5%" }}>
      {ROW_CONFIGS.map((row, rowIdx) => {
        const cells = [];
        for (let i = 0; i < row.cells.length; i++) {
          const cellIdx = idx++;
          const cfg = row.cells[i];
          cells.push(
            <label
              key={cellIdx}
              className="relative overflow-hidden bg-pink-200 rounded-sm cursor-pointer shrink-0"
              style={{
                width: cfg.w,
                aspectRatio: cfg.aspect,
                animation: `heartFloat ${2.6 + ((cellIdx * 0.25) % 1.2)}s ease-in-out infinite`,
                animationDelay: `${(cellIdx * 0.4) % 2}s`,
              }}
            >
              {photos[cellIdx] ? <img src={photos[cellIdx]} alt="" className="object-cover w-full h-full" /> : <span className="absolute inset-0 flex items-center justify-center text-sm text-pink-400">+</span>}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const compressed = await compressImage(file);
                  onUpload(cellIdx, compressed);
                }}
              />
            </label>,
          );
        }
        return (
          <div key={rowIdx} style={{ width: row.rowW, display: "flex", justifyContent: row.justify, gap: row.gap || "1.5%" }}>
            {cells}
          </div>
        );
      })}
    </div>
  );
}

// ─── Heart Card ───────────────────────────────────────────────

function HeartCard({ form, setField }) {
  const [flipped, setFlipped] = useState(false);
  const photos = form.heartPhotos || Array(11).fill("");

  function handlePhotoUpload(index, src) {
    const next = [...photos];
    next[index] = src;
    setField("heartPhotos", next);
  }

  return (
    <div className="w-full" style={{ perspective: "1200px" }}>
      <style>{`
        @keyframes heartFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <div
        className="relative w-full cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          aspectRatio: "3/4",
          containerType: "inline-size",
        }}
        onClick={() => setFlipped((v) => !v)}
      >
        {/* Front */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl" style={{ backfaceVisibility: "hidden" }}>
          <div className="flex flex-col items-center justify-center w-full h-full gap-4 p-6 bg-linear-to-br from-rose-100 via-pink-50 to-rose-200">
            <div className="text-5xl">💌</div>
            <p className="text-xl font-semibold text-center text-rose-700" style={{ fontFamily: "var(--font-dancing)" }}>
              {form.heartTitle || "Một điều bí mật..."}
            </p>
            <p className="text-xs italic text-rose-400">Nhấn để mở thiệp</p>
            <span className="absolute text-2xl opacity-50 top-4 left-4 text-rose-300">✿</span>
            <span className="absolute text-2xl opacity-50 top-4 right-4 text-rose-300">✿</span>
            <span className="absolute text-2xl opacity-50 bottom-4 left-4 text-rose-300">✿</span>
            <span className="absolute text-2xl opacity-50 bottom-4 right-4 text-rose-300">✿</span>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #fff9fb 0%, #fff0f5 40%, #fce4ec 70%, #fdf2f6 100%)" }}>
            {[
              { top: "4%", left: "6%", size: "0.9rem", rot: "20deg", opacity: 0.35 },
              { top: "8%", left: "82%", size: "0.7rem", rot: "-15deg", opacity: 0.25 },
              { top: "15%", left: "92%", size: "1rem", rot: "40deg", opacity: 0.3 },
              { top: "22%", left: "2%", size: "0.6rem", rot: "-30deg", opacity: 0.2 },
              { top: "35%", left: "88%", size: "0.8rem", rot: "10deg", opacity: 0.28 },
              { top: "48%", left: "5%", size: "0.7rem", rot: "55deg", opacity: 0.22 },
              { top: "58%", left: "91%", size: "0.9rem", rot: "-20deg", opacity: 0.3 },
              { top: "68%", left: "3%", size: "0.6rem", rot: "35deg", opacity: 0.2 },
              { top: "75%", left: "85%", size: "0.75rem", rot: "-45deg", opacity: 0.25 },
              { top: "85%", left: "8%", size: "0.8rem", rot: "15deg", opacity: 0.28 },
              { top: "90%", left: "78%", size: "0.65rem", rot: "-25deg", opacity: 0.2 },
              { top: "12%", left: "50%", size: "0.5rem", rot: "60deg", opacity: 0.15 },
              { top: "42%", left: "45%", size: "0.55rem", rot: "-10deg", opacity: 0.13 },
              { top: "70%", left: "55%", size: "0.6rem", rot: "30deg", opacity: 0.15 },
            ].map((p, i) => (
              <span key={i} style={{ position: "absolute", top: p.top, left: p.left, fontSize: p.size, transform: `rotate(${p.rot})`, opacity: p.opacity, pointerEvents: "none", userSelect: "none" }}>
                🌸
              </span>
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="relative flex flex-col items-center" style={{ width: "90%" }}>
              {form.heartTitle && (
                <p className="w-full font-semibold text-center truncate text-rose-600" style={{ fontFamily: "var(--font-dancing)", fontSize: "clamp(1rem, 7cqw, 1.4rem)", paddingBottom: "3%" }}>
                  {form.heartTitle}
                </p>
              )}
              <div className="flex justify-center w-full">
                <HeartGrid photos={photos} onUpload={handlePhotoUpload} />
              </div>
              {form.message && (
                <p
                  className="self-start italic text-rose-400"
                  style={{
                    fontFamily: "var(--font-dancing)",
                    fontSize: "clamp(0.85rem, 6cqw, 1.1rem)",
                    marginTop: "4%",
                    paddingLeft: "2%",
                    maxWidth: "65%",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {form.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Polaroid Preview ─────────────────────────────────────────

function PolaroidPreview({ form, gifTL, gifBR }) {
  const [active, setActive] = useState("polaroid");
  const { photo1, photo2, message = "" } = form;
  const polaroidActive = active === "polaroid";

  return (
    <div className="relative w-full overflow-hidden cursor-pointer select-none bg-rose-950 rounded-2xl" style={{ containerType: "size", aspectRatio: "3/4" }} onClick={() => setActive(polaroidActive ? "letter" : "polaroid")}>
      {/* Letter */}
      <div className={`absolute transition-all duration-500 ${!polaroidActive ? "z-20 opacity-100 blur-none" : "z-0 opacity-40 blur-sm"}`} style={{ top: "50%", left: "50%", width: "80%", transform: "translate(-50%, -50%) rotate(2deg)" }}>
        <div
          className="w-full p-4 rounded-sm shadow-2xl bg-amber-50"
          style={{
            backgroundImage: "repeating-linear-gradient(transparent,transparent 23px,#d4b896 23px,#d4b896 24px)",
            height: "60cqh",
            overflow: "hidden",
            paddingTop: "24px", // đẩy text xuống ngồi đúng trên dòng kẻ đầu tiên
          }}
        >
          <p
            className="text-gray-700 whitespace-pre-wrap wrap-break-word"
            style={{
              fontFamily: "var(--font-dancing)",
              fontSize: "clamp(1rem, 5cqw, 1.4rem)",
              lineHeight: "24px", // khớp đúng với khoảng cách đường kẻ
              paddingTop: "0",
              margin: "0",
            }}
          >
            {message}
          </p>
        </div>
      </div>

      {/* Polaroid 1 */}
      <div className={`absolute transition-all duration-500 ${polaroidActive ? "z-30 opacity-100 blur-none" : "z-10 opacity-50 blur-sm"}`} style={{ top: "8%", right: "10%", width: "50%", transform: "rotate(5deg)" }}>
        <div className="w-full p-2 bg-white shadow-sm ring-1 ring-black ring-opacity-10" style={{ paddingBottom: "22%" }}>
          <div className="w-full overflow-hidden aspect-square bg-zinc-800">{photo1 ? <img src={photo1} alt="" className="object-cover w-full h-full" /> : <div className="w-full h-full" />}</div>
        </div>
      </div>

      {/* Polaroid 2 */}
      <div className={`absolute transition-all duration-500 ${polaroidActive ? "z-30 opacity-100 blur-none" : "z-10 opacity-50 blur-sm"}`} style={{ bottom: "8%", left: "10%", width: "50%", transform: "rotate(-4deg)" }}>
        <div className="w-full p-2 bg-white shadow-sm ring-1 ring-black ring-opacity-10" style={{ paddingBottom: "22%" }}>
          <div className="w-full overflow-hidden aspect-square bg-zinc-800">{photo2 ? <img src={photo2} alt="" className="object-cover w-full h-full" /> : <div className="w-full h-full" />}</div>
        </div>
      </div>

      {/* GIF top-left */}
      <div className={`absolute transition-all duration-500 ${polaroidActive ? "z-30 opacity-100 blur-none" : "z-10 opacity-50 blur-sm"}`} style={{ top: "24%", left: "10%", width: "35%", transform: "rotate(-3deg)" }}>
        <img src={gifTL.src} alt="" className="w-full drop-shadow-xl" />
      </div>

      {/* GIF bottom-right */}
      <div className={`absolute transition-all duration-500 ${polaroidActive ? "z-30 opacity-100 blur-none" : "z-10 opacity-50 blur-sm"}`} style={{ bottom: "0%", right: "18%", width: "35%", transform: "rotate(6deg)" }}>
        <img src={gifBR.src} alt="" className="w-full drop-shadow-xl" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function CreatePage() {
  const [template, setTemplate] = useState("polaroid");
  const [form, setForm] = useState({});
  const [gifTL, setGifTL] = useState(PRESET_GIFS_LEFT[0]);
  const [gifBR, setGifBR] = useState(PRESET_GIFS_RIGHT[0]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [music, setMusic] = useState(null);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSelectTemplate(id) {
    setTemplate((prev) => (prev === id ? prev : id));
    setForm({});
    setErrors({});
    setSubmitted(false);
  }

  function validate() {
    const errs = {};
    const maxMsg = template === "heart" ? MAX_MESSAGE_HEART : MAX_MESSAGE;

    if (!form.message?.trim()) errs.message = "Vui lòng nhập lời chúc";
    else if (form.message.length > maxMsg) errs.message = `Tối đa ${maxMsg} ký tự`;

    if (form.link && form.link.length > MAX_URL) errs.link = `Tối đa ${MAX_URL} ký tự`;

    if (template === "polaroid") {
      if (!form.photo1) errs.photo1 = "Vui lòng chọn ảnh polaroid 1";
      if (!form.photo2) errs.photo2 = "Vui lòng chọn ảnh polaroid 2";
    }

    if (template === "heart") {
      if (!form.heartTitle?.trim()) errs.heartTitle = "Vui lòng nhập tiêu đề thiệp";

      const photos = form.heartPhotos || [];
      const filled = photos.filter(Boolean).length;
      if (filled < 11) errs.heartPhotos = `Cần đủ 11 ảnh (đã có ${filled})`;
    }

    return errs;
  }

  async function handleSubmit() {
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const id = crypto.randomUUID().slice(0, 8);
      const prefix = `${id}`;
      let data = {};

      if (template === "polaroid") {
        const [path1, path2] = await Promise.all([uploadImage(form.photo1, `${prefix}_1.jpg`), uploadImage(form.photo2, `${prefix}_2.jpg`)]);
        data = {
          gifTL: gifTL.id,
          gifTLSrc: gifTL.src, // thêm
          gifBR: gifBR.id,
          gifBRSrc: gifBR.src, // thêm
          photo1: path1,
          photo2: path2,
          music: music ? { src: music.src, title: music.title } : null,
        };
      }

      if (template === "heart") {
        const paths = await Promise.all((form.heartPhotos || []).map((photo, i) => uploadImage(photo, `${prefix}_${i}.jpg`)));
        data = {
          heartTitle: form.heartTitle,
          heartPhotos: paths,
        };
      }

      const { error } = await supabase.from("wishes").insert({
        id,
        template,
        message: form.message,
        link: form.link?.trim() || null,
        data,
      });

      if (error) {
        // Link bị trùng
        if (error.code === "23505") {
          setErrors({ link: "Đường dẫn này đã được dùng, vui lòng chọn tên khác" });
          return;
        }
        throw error;
      }

      router.push(`/wish/${form.link?.trim() || id}`);
    } catch (err) {
      console.error(err);
      setErrors({ general: "Có lỗi xảy ra, vui lòng thử lại" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 py-6 sm:py-10">
      <p className="mb-6 text-2xl font-semibold text-pink-500 sm:text-3xl">Tạo lời chúc</p>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* Form */}
        <div className="flex flex-col flex-1 min-w-0 gap-6">
          {/* Lời chúc */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Lời chúc</label>
              <span className={`text-xs ${(form.message || "").length >= (template === "heart" ? MAX_MESSAGE_HEART : MAX_MESSAGE) ? "text-red-400" : "text-gray-400"}`}>
                {(form.message || "").length}/{template === "heart" ? MAX_MESSAGE_HEART : MAX_MESSAGE}
              </span>
            </div>
            <textarea rows={3} maxLength={template === "heart" ? MAX_MESSAGE_HEART : MAX_MESSAGE} value={form.message || ""} onChange={(e) => setField("message", e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-pink-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-300" />
            {submitted && errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
          </div>

          {/* Đường dẫn */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Đường dẫn <span className="font-normal text-gray-400">(tuỳ chọn)</span>
              </label>
              <span className={`text-xs ${(form.link || "").length >= MAX_URL ? "text-red-400" : "text-gray-400"}`}>
                {(form.link || "").length}/{MAX_URL}
              </span>
            </div>
            <input type="text" maxLength={MAX_URL} value={form.link || ""} onChange={(e) => setField("link", e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
            {submitted && errors.link && <p className="mt-1 text-xs text-red-400">{errors.link}</p>}
          </div>

          {/* Template tabs */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Template</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "polaroid", label: "Polaroid & Thư" },
                { id: "heart", label: "Thiệp Trái Tim" },
              ].map((t) => (
                <button key={t.id} type="button" onClick={() => handleSelectTemplate(t.id)} className={`px-4 py-2 rounded-full text-sm font-medium border ${template === t.id ? "bg-pink-500 text-white border-pink-500" : "bg-white text-pink-500 border-pink-300 hover:border-pink-400"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template 1: Polaroid */}
          {template === "polaroid" && (
            <div className="flex flex-col gap-4 p-4 border border-pink-100 rounded-xl bg-pink-50">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <ImagePicker label="Ảnh polaroid 1" value={form.photo1 || ""} onChange={(v) => setField("photo1", v)} />
                  {submitted && errors.photo1 && <p className="text-xs text-red-400">{errors.photo1}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <ImagePicker label="Ảnh polaroid 2" value={form.photo2 || ""} onChange={(v) => setField("photo2", v)} />
                  {submitted && errors.photo2 && <p className="text-xs text-red-400">{errors.photo2}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <GifPicker label="GIF góc trái" value={gifTL} onChange={setGifTL} presets={PRESET_GIFS_LEFT} />
                <GifPicker label="GIF góc phải" value={gifBR} onChange={setGifBR} presets={PRESET_GIFS_RIGHT} />
              </div>
              <MusicPicker value={music} onChange={setMusic} />
            </div>
          )}

          {/* Template 2: Heart */}
          {template === "heart" && (
            <div className="flex flex-col gap-4 p-4 border border-pink-100 rounded-xl bg-pink-50">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Tiêu đề thiệp</label>
                  <span className={`text-xs ${(form.heartTitle || "").length >= 25 ? "text-red-400" : "text-gray-400"}`}>{(form.heartTitle || "").length}/25</span>
                </div>
                <input type="text" maxLength={25} value={form.heartTitle || ""} onChange={(e) => setField("heartTitle", e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
                {submitted && errors.heartTitle && <p className="mt-1 text-xs text-red-400">{errors.heartTitle}</p>}
              </div>
              <p className="text-xs text-gray-400">Nhấn vào từng ô trong preview để chọn ảnh</p>
              {submitted && errors.heartPhotos && <p className="text-xs text-red-400">{errors.heartPhotos}</p>}
            </div>
          )}

          <button type="button" onClick={handleSubmit} disabled={loading} className={`self-start px-8 py-2.5 text-sm font-medium text-white rounded-full ${loading ? "bg-pink-300 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600"}`}>
            {loading ? "Đang tạo..." : "Tạo lời chúc"}
          </button>
          {submitted && errors.general && <p className="text-xs text-red-400">{errors.general}</p>}
        </div>

        {/* Preview */}
        <div className="lg:w-72 xl:w-80">
          <p className="mb-3 text-sm font-medium text-gray-500">Xem trước</p>
          <div className="overflow-hidden shadow-lg rounded-2xl ring-1 ring-pink-200">
            {template === "polaroid" && <PolaroidPreview form={form} gifTL={gifTL} gifBR={gifBR} />}
            {template === "heart" && <HeartCard form={form} setField={setField} />}
          </div>
        </div>
      </div>
    </div>
  );
}
