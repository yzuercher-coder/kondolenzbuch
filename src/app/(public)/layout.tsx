export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-20">
      <header className="bg-neutral-0 border-b border-neutral-40 shadow-f2">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center gap-3">
          <div className="w-6 h-6 bg-brand-60 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">K</span>
          </div>
          <span className="text-sm font-semibold text-neutral-110">Kondolenzbuch</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
