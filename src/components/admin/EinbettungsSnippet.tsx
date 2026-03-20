"use client";

import { useState } from "react";

interface Props {
  token: string;
}

export default function EinbettungsSnippet({ token }: Props) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const iframeCode = `<iframe
  src="${baseUrl}/widget/${token}"
  width="100%"
  height="400"
  style="border:none;border-radius:8px;"
  loading="lazy"
  title="Kondolenzbuch"
></iframe>`;

  async function copy() {
    await navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card overflow-hidden max-w-2xl">
      <div className="px-5 py-3 bg-neutral-20 border-b border-neutral-40">
        <h3>Einbettungs-Widget (UC-007)</h3>
      </div>
      <div className="p-5 space-y-3">
        <p className="text-sm text-neutral-80">
          Fügen Sie diesen Code auf Ihrer Website ein, um das Kondolenzbuch einzubetten:
        </p>
        <div className="relative">
          <pre className="bg-neutral-110 text-neutral-20 text-xs p-4 rounded overflow-x-auto leading-relaxed">
            {iframeCode}
          </pre>
          <button
            onClick={copy}
            className="absolute top-2 right-2 btn-secondary text-xs"
          >
            {copied ? "✓ Kopiert" : "Kopieren"}
          </button>
        </div>
        <a
          href={`/widget/${token}`}
          target="_blank"
          className="text-sm text-brand-60 hover:text-brand-70"
        >
          Vorschau öffnen →
        </a>
      </div>
    </div>
  );
}
