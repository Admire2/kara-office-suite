"use client";
import { useState } from "react";
import Link from "next/link";

export default function MobileNav({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/kaws", label: "KAWS Hub", icon: "🌐" },
    { href: "/kaws/real-estate", label: "Real Estate Suite", icon: "🏘️" },
    { href: "/kaws/mls", label: "MLS Connector", icon: "📡" },
    { href: "/kaws/mobile-dfd", label: "Driving for Dollars", icon: "📱" },
    { href: "/kaws/coordinator", label: "Transaction Coordinator", icon: "📋" },
    { href: "/kaws/contract", label: "Contract Review", icon: "⚖️" },
    { href: "/onboard", label: "Launch AI Agent", icon: "" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setIsOpen(true)} className="p-2 text-slate-300 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white">FounderPilot AI</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
          <div className="relative w-72 bg-slate-900 h-full overflow-y-auto border-r border-slate-800 animate-in slide-in-from-left">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-800 mt-auto">
              <div className="text-xs text-slate-500 text-center">
                KAWS v1.0 • Licensed Agent Track
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Mobile Bottom Nav (Quick Access) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-4 py-2 flex justify-around items-center z-40">
        <Link href="/" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white transition">
          <span className="text-xl">🏠</span>
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/kaws" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white transition">
          <span className="text-xl">🌐</span>
          <span className="text-[10px]">KAWS</span>
        </Link>
        <Link href="/kaws/real-estate" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white transition">
          <span className="text-xl">🏘️</span>
          <span className="text-[10px]">Real Estate</span>
        </Link>
        <Link href="/kaws/mobile-dfd" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white transition">
          <span className="text-xl">📱</span>
          <span className="text-[10px]">Mobile</span>
        </Link>
        <Link href="/onboard" className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white transition">
          <span className="text-xl">🚀</span>
          <span className="text-[10px]">Launch</span>
        </Link>
      </nav>
    </div>
  );
}