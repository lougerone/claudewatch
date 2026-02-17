"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/requests", label: "Request Log" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 border-r border-border bg-card flex flex-col">
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          {/* Abstract starburst mark */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path
              d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
              fill="currentColor"
              opacity="0.85"
            />
          </svg>
          <span className="font-sans text-[15px] font-semibold tracking-tight text-foreground">
            ClaudeWatch
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 ml-[34px] font-serif italic">
          Token Analytics
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded text-[13px] font-sans transition-colors ${
                active
                  ? "bg-accent-muted text-accent font-medium"
                  : "text-ink-700 hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-border">
        <p className="text-[10px] text-ink-300 font-mono">v1.0.0</p>
      </div>
    </aside>
  );
}
