"use client";

import { useState, useRef } from "react";

export default function MusicPicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState("idle"); // idle | search | notfound | ratelimit | error
  const [playing, setPlaying] = useState(null);

  const audioRef = useRef(null);
  const debounceRef = useRef(null);

  // ─── Search ───────────────────────────────────────────────────

  async function searchMusic(q) {
    stopAudio();
    setSearching(true);
    try {
      const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID}&format=json&limit=20&search=${encodeURIComponent(q)}&audiodlformat=mp32&boost=popularity_total&durationbetween=0_60`);

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

      const data = await res.json();
      const tracks = (data.results || []).filter((t) => t.duration > 0 && t.duration <= 60);

      if (tracks.length === 0) {
        setResults([]);
        setMode("notfound");
        return;
      }

      setResults(tracks);
      setMode("search");
    } catch {
      setResults([]);
      setMode("error");
    } finally {
      setSearching(false);
    }
  }

  // ─── Input ────────────────────────────────────────────────────

  function handleInput(e) {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);

    if (!q.trim()) {
      stopAudio();
      setResults([]);
      setMode("idle");
      return;
    }

    debounceRef.current = setTimeout(() => searchMusic(q), 500);
  }

  // ─── Audio ────────────────────────────────────────────────────

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.oncanplay = null;
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setPlaying(null);
  }

  function handlePreview(track) {
    if (playing === track.id) {
      stopAudio();
      return;
    }

    stopAudio();
    setPlaying(track.id);

    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = 0.5;

    const play = () => {
      if (audioRef.current !== audio) return;
      audio.play().catch(() => {
        if (audioRef.current === audio) setPlaying(null);
      });
    };

    audio.onended = () => {
      if (audioRef.current === audio) setPlaying(null);
    };

    audio.onerror = () => {
      if (audioRef.current === audio) setPlaying(null);
    };

    audio.oncanplay = play;
    audio.src = track.audio;
    audioRef.current = audio;
  }

  // ─── Select / Clear ───────────────────────────────────────────

  function handleSelect(track) {
    stopAudio();
    onChange({ id: track.id, src: track.audio, title: track.name });
  }

  function handleClear() {
    stopAudio();
    onChange(null);
  }

  // ─── Format duration ─────────────────────────────────────────

  function formatDuration(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Nhạc nền <span className="font-normal text-gray-400">(tuỳ chọn)</span>
        </span>
        {value && (
          <button type="button" onClick={handleClear} className="cursor-pointer text-xs text-red-400 hover:text-red-500">
            Xoá
          </button>
        )}
      </div>

      {/* Selected track */}
      {value && (
        <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 border border-pink-200 rounded-lg">
          <span className="text-base">🎵</span>
          <span className="text-xs text-gray-700 truncate flex-1">{value.title}</span>
        </div>
      )}

      {/* Search input */}
      <input type="text" value={query} onChange={handleInput} placeholder="Tìm nhạc..." className="w-full px-3 py-1.5 text-xs bg-white border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />

      {/* Results */}
      {mode !== "idle" && (
        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto rounded-lg border border-pink-100 bg-white p-1">
          {/* Loading */}
          {searching && (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Rate limit */}
          {!searching && mode === "ratelimit" && <p className="text-xs text-center text-amber-500 py-3">Đã đạt giới hạn tìm kiếm, vui lòng thử lại sau ít phút.</p>}

          {/* Error */}
          {!searching && mode === "error" && <p className="text-xs text-center text-red-400 py-3">Không thể tải nhạc, vui lòng thử lại.</p>}

          {/* Not found */}
          {!searching && mode === "notfound" && <p className="text-xs text-center text-gray-400 py-3">Không tìm thấy kết quả</p>}

          {/* Track list */}
          {!searching &&
            mode === "search" &&
            results.map((track) => (
              <div key={track.id} className={`flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-pink-50 transition-colors ${value?.id === track.id ? "bg-pink-50 border border-pink-200" : ""}`}>
                <button type="button" onClick={() => handlePreview(track)} className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-full bg-pink-100 hover:bg-pink-200 shrink-0 text-xs">
                  {playing === track.id ? "⏸" : "▶"}
                </button>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-gray-700 truncate">{track.name}</span>
                  <span className="text-xs text-gray-400 truncate">{track.artist_name}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatDuration(track.duration)}</span>
                <button type="button" onClick={() => handleSelect(track)} className="cursor-pointer px-2 py-0.5 text-xs font-medium text-white bg-pink-500 rounded-full hover:bg-pink-600 shrink-0">
                  Chọn
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
