"use client";

import { useState, useRef } from "react";

interface Props {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
}

export default function PortraitUpload({ currentUrl, onUpload }: Props) {
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
      <label className="label">Portrait</label>
      <div
        className="relative w-32 h-32 rounded-full border-2 border-dashed border-neutral-50 hover:border-brand-60 transition-colors cursor-pointer overflow-hidden bg-neutral-20 flex items-center justify-center"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {preview ? (
          <img src={preview} alt="Portrait" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center px-2">
            <div className="text-2xl text-neutral-60 mb-1">+</div>
            <p className="text-xs text-neutral-70">Foto hochladen</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-neutral-0/70 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-brand-60 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {preview && (
        <button
          type="button"
          onClick={() => { setPreview(null); onUpload(""); }}
          className="text-xs text-neutral-70 hover:text-[#A4262C] mt-2 block"
        >
          Entfernen
        </button>
      )}
      {error && <p className="field-error mt-1">{error}</p>}
      <p className="text-xs text-neutral-70 mt-1">JPEG, PNG oder WebP · max. 5 MB</p>
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
