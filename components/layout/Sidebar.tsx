"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/twin", label: "Digital Twin Explorer" },
  { href: "/search", label: "Search" },
  { href: "/assistant", label: "VCC Assistant" },
  { href: "/diagnostics", label: "Diagnostics" },
  { href: "/vcc-reference", label: "VCC Knowledge" },
  { href: "/validate", label: "Validation Center" },
];

export default function Sidebar() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
  }, [pathname]);

  if (pathname === "/login") return null;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4">
      <div className="mb-6 font-semibold text-slate-800">VCC Digital Twin</div>
      <ul className="flex-1 space-y-1">
        {nav.map((n) => (
          <li key={n.href}>
            <Link href={n.href} className="block rounded px-3 py-2 text-sm hover:bg-slate-100">
              {n.label}
            </Link>
          </li>
        ))}
      </ul>
      {user && (
        <div className="border-t border-slate-200 pt-3 text-xs">
          <div className="font-medium text-slate-700">{user.name}</div>
          <div className="mb-2 text-slate-400">{user.role}</div>
          <button onClick={logout} className="text-slate-500 hover:underline">
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
