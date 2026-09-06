"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AffiliateDashboard() {
  const [user, setUser] = useState<any>(null);
  const [origin, setOrigin] = useState("");
  const [aff, setAff] = useState<any>(null);
  const [refs, setRefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) { setUser(session.user); await loadAff(session.user.email); }
      setLoading(false);
    };
    init();
  }, []);

  const loadAff = async (email: string) => {
    const { data } = await supabase.from("affiliates").select("*").eq("email", email).limit(1);
    if (data && data.length > 0) {
      setAff(data[0]);
      const { data: r } = await supabase.from("referrals").select("*").eq("affiliate_code", data[0].affiliate_code).order("created_at", { ascending: false });
      setRefs(r || []);
    }
  };

  const join = async () => {
    setJoining(true);
    const code = user.email.split("@")[0].replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const etNow = new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour12: false });
    const { error } = await supabase.from("affiliates").insert({ email: user.email, affiliate_code: code, commission_rate: 20, created_at_et: etNow });
    if (!error) await loadAff(user.email); else alert("Could not join: " + error.message);
    setJoining(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(origin + "/?ref=" + aff.affiliate_code);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-12 text-center text-white">Loading...</div>;
  if (!user) return <div className="p-12 text-center text-white">Please log in at /auth to view your affiliate dashboard.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-2">🤝 Affiliate Partner Dashboard</h1>
      <p className="text-slate-400 mb-8">Welcome, {user.email}</p>

      {!aff ? (
        <div className="max-w-md bg-slate-900 border border-fuchsia-500/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Become an Affiliate Partner</h2>
          <p className="text-slate-400 mb-6">Earn 20% commission on every client you bring to FounderPilot.</p>
          <button onClick={join} disabled={joining} className="bg-fuchsia-600 hover:bg-fuchsia-500 px-8 py-3 rounded-full font-bold">{joining ? "Joining..." : "Join the Program"}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          <div className="bg-slate-900 border border-fuchsia-500/30 rounded-xl p-6 md:col-span-2">
            <h2 className="text-xl font-bold text-fuchsia-300 mb-4">Your Unique Referral Link</h2>
            <div className="flex items-center gap-2">
              <input readOnly value={origin + "/?ref=" + aff.affiliate_code} className="flex-1 p-3 bg-slate-800 rounded font-mono text-sm" />
              <button onClick={copyLink} className="bg-fuchsia-600 hover:bg-fuchsia-500 px-6 py-3 rounded font-bold">{copied ? "✅ Copied!" : "Copy"}</button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Commission rate: {aff.commission_rate}% per paid client</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-2">Total Signups</h2>
            <p className="text-5xl font-black text-emerald-400">{refs.length}</p>
            <p className="text-xs text-slate-500 mt-2">People who joined via your link</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-2">Total Earned</h2>
            <p className="text-5xl font-black text-fuchsia-400">${Number(aff.total_earned || 0).toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-2">Commission ready for payout</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 md:col-span-2">
            <h2 className="text-lg font-bold mb-4">Your Referred Users</h2>
            {refs.length === 0 ? <p className="text-slate-500">No referrals yet. Share your link!</p> : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-fuchsia-300"><th>Email</th><th>Status</th><th>When (ET)</th></tr></thead>
                <tbody>
                  {refs.map((r, i) => (
                    <tr key={i} className="border-t border-slate-800"><td>{r.referred_email}</td><td>{r.status}</td><td>{r.timestamp_et}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}