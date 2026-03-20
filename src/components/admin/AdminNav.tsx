"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Heart,
} from "lucide-react";

interface Props {
  user?: { name?: string | null; email?: string | null };
}

const navItems = [
  { href: "/dashboard",     label: "Dashboard",        icon: LayoutDashboard },
  { href: "/todesanzeigen", label: "Todesanzeigen",    icon: FileText },
  { href: "/kondolenzen",   label: "Kondolenzen",      icon: MessageSquare },
  { href: "/benutzer",      label: "Benutzer",         icon: Users },
];

export default function AdminNav({ user }: Props) {
  const pathname = usePathname();
  const initials = ((user?.name ?? user?.email ?? "A")[0]).toUpperCase();
  const displayName = user?.name ?? user?.email ?? "Admin";

  return (
    <aside className="w-56 min-h-screen bg-gray-900 flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Heart className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white leading-tight">Kondolenzbuch</div>
          <div className="text-[11px] text-white/40 mt-0.5">Admin-Bereich</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <p className="px-2 pt-2 pb-1 text-[11px] font-semibold text-white/30 uppercase tracking-widest">
          Verwaltung
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-gray-800 text-white"
                  : "text-white/60 hover:bg-gray-800 hover:text-white/90"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-indigo-500 rounded-r" />
              )}
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        <p className="px-2 pt-4 pb-1 text-[11px] font-semibold text-white/30 uppercase tracking-widest">
          System
        </p>
        <Link
          href="/einstellungen"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium text-white/60 hover:bg-gray-800 hover:text-white/90 transition-colors"
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          Einstellungen
        </Link>
      </nav>

      {/* User footer */}
      <div className="px-2 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-default">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-white/80 truncate">{displayName}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-white/30 hover:text-white/70 transition-colors"
            title="Abmelden"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
