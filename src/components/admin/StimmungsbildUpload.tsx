"use client";

import { useState, useRef } from "react";
import { ImageIcon, X } from "lucide-react";

interface Props {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
}

export default function StimmungsbildUpload({ currentUrl, onUpload }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data.url);
      onUpload(data.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <div
        className="relative w-full h-48 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer overflow-hidden bg-gray-50 flex items-center justify-center"
        onClick={() => !preview && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Stimmungsbild"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPreview(null); onUpload(""); }}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
              title="Entfernen"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs rounded-lg px-3 py-1.5 transition-colors"
            >
              Ersetzen
            </button>
          </>
        ) : (
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">Bild hierher ziehen oder klicken</p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG oder WebP · max. 5 MB · empfohlen 1920×600 px</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1.5">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
