"use client";

import { useEffect, useRef, useState } from "react";

const NOTES = ["♩", "♪", "♫", "♬"];

function FloatingNote({ note, style }) {
  return (
    <span className="absolute text-pink-400 pointer-events-none select-none" style={style}>
      {note}
    </span>
  );
}

export default function MusicPlayer({ src, title }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [notes, setNotes] = useState([]);
  const noteIdRef = useRef(0);
  const noteIntervalRef = useRef(null);

  // Autoplay khi mount
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    function startOnInteraction() {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("touchstart", startOnInteraction);
    }

    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        document.addEventListener("click", startOnInteraction);
        document.addEventListener("touchstart", startOnInteraction);
      });

    return () => {
      audio.pause();
      audio.src = "";
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("touchstart", startOnInteraction);
    };
  }, [src]);

  // Floating notes khi đang play
  useEffect(() => {
    if (playing) {
      noteIntervalRef.current = setInterval(() => {
        const id = noteIdRef.current++;
        const note = NOTES[Math.floor(Math.random() * NOTES.length)];
        const left = 10 + Math.random() * 80; // % từ trái

        setNotes((prev) => [
          ...prev.slice(-6), // giữ tối đa 6 note
          { id, note, left },
        ]);

        // Xóa note sau 2.5s
        setTimeout(() => {
          setNotes((prev) => prev.filter((n) => n.id !== id));
        }, 2500);
      }, 600);
    } else {
      clearInterval(noteIntervalRef.current);
    }

    return () => clearInterval(noteIntervalRef.current);
  }, [playing]);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* Floating notes */}
      <div className="relative w-full h-0">
        {notes.map((n) => (
          <FloatingNote
            key={n.id}
            note={n.note}
            style={{
              left: `${n.left}%`,
              bottom: "0px",
              fontSize: `${0.7 + Math.random() * 0.5}rem`,
              opacity: 0,
              animation: "noteFloat 2.5s ease-out forwards",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes noteFloat {
          0%   { transform: translateY(0px) rotate(0deg); opacity: 0.9; }
          50%  { transform: translateY(-40px) rotate(15deg); opacity: 0.6; }
          100% { transform: translateY(-80px) rotate(-10deg); opacity: 0; }
        }
      `}</style>

      {/* Player bar */}
      <button type="button" onClick={toggle} className="cursor-pointer flex items-center gap-2.5 px-4 py-2.5 bg-white border border-pink-200 rounded-full shadow-lg hover:shadow-xl transition-shadow">
        {/* Icon */}
        <div className={`w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${playing ? "bg-pink-500" : "bg-pink-200"}`}>
          <span className="text-white text-xs">{playing ? "⏸" : "▶"}</span>
        </div>

        {/* Waveform animation */}
        {playing ? (
          <div className="flex items-center gap-0.5 h-4 shrink-0">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-0.5 bg-pink-400 rounded-full"
                style={{
                  animation: `wave 0.8s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                  height: "100%",
                }}
              />
            ))}
          </div>
        ) : (
          <span className="text-base">🎵</span>
        )}

        {/* Title */}
        <span className="text-xs text-gray-600 max-w-36 truncate">{title}</span>
      </button>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.3); }
          50%       { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
