"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface Props {
  user?: { name?: string | null; email?: string | null };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/todesanzeigen", label: "Todesanzeigen" },
  { href: "/kondolenzen", label: "Kondolenzen" },
  { href: "/benutzer", label: "Benutzer" },
];

export default function AdminNav({ user }: Props) {
  const pathname = usePathname();

  return (
    <nav className="bg-neutral-0 border-b border-neutral-40 shadow-f2">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-12">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-4 border-r border-neutral-40">
            <div className="w-6 h-6 bg-brand-60 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">K</span>
            </div>
            <span className="text-sm font-semibold text-neutral-110">Kondolenzbuch</span>
          </div>
          <div className="flex gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  pathname.startsWith(item.href) ? "nav-link-active" : "nav-link"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-60 flex items-center justify-center text-white text-xs font-semibold">
              {(user?.name ?? user?.email ?? "A")[0].toUpperCase()}
            </div>
            <span className="text-sm text-neutral-90 hidden sm:block">
              {user?.name ?? user?.email}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-subtle text-xs"
          >
            Abmelden
          </button>
        </div>
      </div>
    </nav>
  );
}
