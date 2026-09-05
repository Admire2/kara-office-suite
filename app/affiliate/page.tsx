"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AffiliateDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({ referrals: 0, earned: 0, code: "" });
  const [copied, setCopied] = useState(false); const [origin, setOrigin] = useState("");

  useEffect(() => {
    const getUser = async () => {
      setOrigin(window.location.origin); const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
    };
    getUser();
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(`${origin}?ref=${stats.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return <div className="p-12 text-center text-white">Please log in to view your affiliate dashboard.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-2">🤝 Affiliate Partner Dashboard</h1>
      <p className="text-slate-400 mb-8">Welcome, {user.email}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Referral Link Box */}
        <div className="bg-slate-900 border border-fuchsia-500/30 rounded-xl p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-fuchsia-300 mb-4">Your Unique Referral Link</h2>
          <div className="flex items-center gap-2">
            <input 
              readOnly 
              value={`${origin}?ref=${stats.code || "your-code"}`} 
              className="flex-1 p-3 bg-slate-800 rounded font-mono text-sm" 
            />
            <button 
              onClick={copyLink} 
              className="bg-fuchsia-600 hover:bg-fuchsia-500 px-6 py-3 rounded font-bold"
            >
              {copied ? "✅ Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Share this link. When someone signs up using it, you get credited!</p>
        </div>

        {/* Stats */}
        <div className="bg-slate-900 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">Total Signups</h2>
          <p className="text-5xl font-black text-emerald-400">{stats.referrals}</p>
          <p className="text-xs text-slate-500 mt-2">People who joined via your link</p>
        </div>

        <div className="bg-slate-900 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">Total Earned</h2>
          <p className="text-5xl font-black text-fuchsia-400">${stats.earned}</p>
          <p className="text-xs text-slate-500 mt-2">Commission ready for payout</p>
        </div>
      </div>
    </div>
  );
}