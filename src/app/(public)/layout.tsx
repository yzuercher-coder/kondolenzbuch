import Link from "next/link";
import { Heart } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link href="/anzeigen" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold text-gray-900">Kondolenzbuch</span>
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
