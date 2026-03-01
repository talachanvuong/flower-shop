"use client";

import { useState } from "react";

export const PRESET_GIFS_LEFT = [
  { id: "l1", src: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXVtNTQ2NHdtc3cyYWZ0OXQyNmJkaWl4NDY2NzZuaG0yOXEwZTN1ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/I5r4ErmOa63wAy9spl/giphy.gif" },
  { id: "l2", src: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWxxenExbW55YTd0ZHhhcHZpYWE3dGtiOTI4dzNnM3ZmM3dpNGV5MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/euW6JDwrMn0BqyNC8t/giphy.gif" },
  { id: "l3", src: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExanYwaThzdDdhdmhucTBuYjlueXc5NmM1bzM0YmR3YWpkbXByeW02dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/VM1fcpu2bKs1e2Kdbj/giphy.gif" },
  { id: "l4", src: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjJrN2N4dzVtczd1a2ppeTdraW5uNzcwNXM5Y2IyODBqdTB3c2poNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/XFnttoh4gJzhLEHzf2/giphy.gif" },
  { id: "l5", src: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW9weHNubW1tcTN3ZjNtMzg1MzMwMTB4YjBsZG44cDE4NzBzZWt4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/32sJEBHafCBjfHCt67/giphy.gif" },
];

export const PRESET_GIFS_RIGHT = [
  { id: "r1", src: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmZwbWw5bjdmaHN1djA3MDRqN2lhbHVoMG1rM203YTBjMTRsano0bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Oj5MkUfa9yOSA/giphy.gif" },
  { id: "r2", src: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3h5NnhpMzd3bHN1OHN6ZnBwNHI3cW55Y2Z5MXMwZmxmam5iOXB3eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Urf2Tyvtq3yyYwthM3/giphy.gif" },
  { id: "r3", src: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDduZnc3dDYydWV5d3hlMW9ndXA0bXo0MGw3dTlkOWNjcGpzdDJ1MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/1hoKkBNSBxVyHIsPer/giphy.gif" },
  { id: "r4", src: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnN5bWRwcDZscjNpbTdrY2dnZGpncnQ4bW40ODJmbWh4N3A1d2x4dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/aA2YfDOirPs1439Sy0/giphy.gif" },
  { id: "r5", src: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnB1ajhlZzZodnprOHpvcjIxNWlkbTU4dzNhOGM2Yjl5Ynd1eWhiMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/uJBS8UxetPSC1joSfA/giphy.gif" },
];

export const ROW_CONFIGS = [
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

// ─── HeartGridDisplay (read-only) ────────────────────────────

export function HeartGridDisplay({ photos }) {
  let idx = 0;
  return (
    <div className="flex flex-col items-center w-full" style={{ gap: "1.5%" }}>
      {ROW_CONFIGS.map((row, rowIdx) => {
        const cells = [];
        for (let i = 0; i < row.cells.length; i++) {
          const cellIdx = idx++;
          const cfg = row.cells[i];
          cells.push(
            <div
              key={cellIdx}
              className="relative overflow-hidden bg-pink-200 rounded-sm shrink-0"
              style={{
                width: cfg.w,
                aspectRatio: cfg.aspect,
                animation: `heartFloat ${2.6 + ((cellIdx * 0.25) % 1.2)}s ease-in-out infinite`,
                animationDelay: `${(cellIdx * 0.4) % 2}s`,
              }}
            >
              {photos[cellIdx] && <img src={photos[cellIdx]} alt="" className="object-cover w-full h-full" />}
            </div>,
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

// ─── PolaroidDisplay ─────────────────────────────────────────

export function PolaroidDisplay({ message, photo1, photo2, gifTL, gifBR }) {
  const [active, setActive] = useState("polaroid");
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
          }}
        >
          <p className="leading-6 text-gray-700 whitespace-pre-wrap wrap-break-word" style={{ fontFamily: "var(--font-dancing)", fontSize: "clamp(1rem, 5cqw, 1.4rem)" }}>
            {message}
          </p>
        </div>
      </div>

      {/* Polaroid 1 */}
      <div className={`absolute transition-all duration-500 ${polaroidActive ? "z-30 opacity-100 blur-none" : "z-10 opacity-50 blur-sm"}`} style={{ top: "8%", right: "10%", width: "50%", transform: "rotate(5deg)" }}>
        <div className="w-full p-2 bg-white shadow-sm ring-1 ring-black ring-opacity-10" style={{ paddingBottom: "22%" }}>
          <div className="w-full overflow-hidden aspect-square bg-zinc-800">{photo1 && <img src={photo1} alt="" className="object-cover w-full h-full" />}</div>
        </div>
      </div>

      {/* Polaroid 2 */}
      <div className={`absolute transition-all duration-500 ${polaroidActive ? "z-30 opacity-100 blur-none" : "z-10 opacity-50 blur-sm"}`} style={{ bottom: "8%", left: "10%", width: "50%", transform: "rotate(-4deg)" }}>
        <div className="w-full p-2 bg-white shadow-sm ring-1 ring-black ring-opacity-10" style={{ paddingBottom: "22%" }}>
          <div className="w-full overflow-hidden aspect-square bg-zinc-800">{photo2 && <img src={photo2} alt="" className="object-cover w-full h-full" />}</div>
        </div>
      </div>

      {/* GIF top-left */}
      <div className={`absolute transition-all duration-500 ${polaroidActive ? "z-30 opacity-100 blur-none" : "z-10 opacity-50 blur-sm"}`} style={{ top: "24%", left: "10%", width: "35%", transform: "rotate(-3deg)" }}>
        {gifTL && <img src={gifTL} alt="" className="w-full drop-shadow-xl" />}
      </div>

      {/* GIF bottom-right */}
      <div className={`absolute transition-all duration-500 ${polaroidActive ? "z-30 opacity-100 blur-none" : "z-10 opacity-50 blur-sm"}`} style={{ bottom: "0%", right: "18%", width: "35%", transform: "rotate(6deg)" }}>
        {gifBR && <img src={gifBR} alt="" className="w-full drop-shadow-xl" />}
      </div>
    </div>
  );
}

// ─── HeartDisplay ─────────────────────────────────────────────

export function HeartDisplay({ message, heartTitle, heartPhotos }) {
  const [flipped, setFlipped] = useState(false);

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
              {heartTitle || "Một điều bí mật..."}
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
              {heartTitle && (
                <p className="w-full font-semibold text-center truncate text-rose-600" style={{ fontFamily: "var(--font-dancing)", fontSize: "clamp(1rem, 7cqw, 1.4rem)", paddingBottom: "3%" }}>
                  {heartTitle}
                </p>
              )}
              <div className="flex justify-center w-full">
                <HeartGridDisplay photos={heartPhotos || []} />
              </div>
              {message && (
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
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
