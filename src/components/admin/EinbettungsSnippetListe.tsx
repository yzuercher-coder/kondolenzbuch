"use client";

import { useState } from "react";
import { Copy, Check, Monitor } from "lucide-react";

interface Props { widgetToken: string }

export default function EinbettungsSnippetListe({ widgetToken }: Props) {
  const [kopiert, setKopiert] = useState(false);

  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://kondolenzbuch.ch";

  const iframeUrl  = `${baseUrl}/widget/liste/${widgetToken}`;
  const snippet    = `<iframe\n  src="${iframeUrl}"\n  width="100%"\n  height="500"\n  frameborder="0"\n  style="border-radius:12px;overflow:hidden;"\n  title="Kondolenzbücher"\n></iframe>`;
  const scriptSnip = `<script src="${baseUrl}/widget.js" data-token="${widgetToken}" data-height="500"></script>`;

  async function kopieren(text: string) {
    await navigator.clipboard.writeText(text);
    setKopiert(true);
    setTimeout(() => setKopiert(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* iFrame */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">iFrame-Einbettung</p>
          <button onClick={() => kopieren(snippet)}
            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            {kopiert ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {kopiert ? "Kopiert!" : "Kopieren"}
          </button>
        </div>
        <pre className="bg-gray-900 text-green-400 text-xs rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all font-mono">
          {snippet}
        </pre>
      </div>

      {/* Vorschau-Link */}
      <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
        <Monitor className="w-4 h-4 text-indigo-400 flex-shrink-0" />
        <div className="text-sm text-indigo-800 min-w-0">
          <span className="font-medium">Widget-URL: </span>
          <a href={iframeUrl} target="_blank" rel="noopener noreferrer"
            className="text-indigo-600 hover:underline break-all">
            {iframeUrl}
          </a>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Der Widget-Token ist eindeutig für dieses Unternehmen. Klick auf eine Karte öffnet das Kondolenzbuch in einem neuen Tab.
      </p>
    </div>
  );
}
