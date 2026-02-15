"use client";

import {
  BarChart3,
  CheckCircle,
  Layers,
  Menu,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/icp", label: "ICP", icon: Layers },
  { href: "/leads", label: "All Leads", icon: Users },
  { href: "/leads/qualified", label: "Qualified", icon: CheckCircle },
  { href: "/leads/disqualified", label: "Disqualified", icon: XCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative w-64 h-screen bg-slate-900 text-white transition-transform duration-300 z-40 flex flex-col`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold">LeadScore</h1>
          <p className="text-sm text-slate-400">Lead Qualification Portal</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            © 2026 LeadScore. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  );
}
