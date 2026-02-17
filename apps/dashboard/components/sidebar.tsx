"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Overview", icon: "~" },
  { href: "/requests", label: "Requests", icon: ">" },
  { href: "/analytics", label: "Analytics", icon: "#" },
  { href: "/settings", label: "Settings", icon: "*" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-border bg-card flex flex-col">
      <div className="p-5 border-b border-border">
        <h1 className="text-lg font-semibold tracking-tight">ClaudeWatch</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Token Analytics</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                active
                  ? "bg-teal-600 text-white"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="font-mono text-xs w-4 text-center opacity-60">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground font-mono">v1.0.0</p>
      </div>
    </aside>
  );
}
