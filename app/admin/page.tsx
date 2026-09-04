"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState(2000);
  const [reason, setReason] = useState("testing");
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    await supabase.auth.refreshSession();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || "";
  };

  useEffect(() => { loadAllUsage(); }, []);

  const loadAllUsage = async () => {
    const tok = await getToken();
    if (!tok) return;
    const r = await fetch("/api/admin/credits", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok }, body: JSON.stringify({ action: "get_all_usage" }) });
    const j = await r.json();
    setUsage(j.usage || []);
  };

  const adjust = async () => {
    setLoading(true);
    const tok = await getToken();
    if (!tok) { alert("Not signed in. Go to /auth, sign in as your admin email, then return here."); setLoading(false); return; }
    const r = await fetch("/api/admin/credits", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok }, body: JSON.stringify({ action: "adjust", email, credits, reason }) });
    const j = await r.json();
    if (j.success) { alert("Adjusted: " + j.oldBalance + " -> " + j.newBalance); loadAllUsage(); }
    else { alert("Error: " + j.error); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel - Credit Management</h1>
      <div className="bg-slate-900 rounded-xl p-6 mb-6 max-w-md">
        <h2 className="text-xl font-bold mb-4">Adjust Credits</h2>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 mb-2 bg-slate-800 rounded" />
        <input type="number" value={credits} onChange={e => setCredits(+e.target.value)} placeholder="Credits (+/-)" className="w-full p-2 mb-2 bg-slate-800 rounded" />
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason" className="w-full p-2 mb-4 bg-slate-800 rounded" />
        <button onClick={adjust} disabled={loading} className="bg-fuchsia-600 px-6 py-2 rounded font-bold hover:bg-fuchsia-500 disabled:opacity-40">{loading ? "Adjusting..." : "Adjust Credits"}</button>
        <p className="text-xs text-slate-400 mt-2">Must be signed in at /auth as an admin email first.</p>
      </div>
      <div className="bg-slate-900 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Usage (last 100, Eastern Time)</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-fuchsia-300"><th>Time (ET)</th><th>Email</th><th>Action</th><th>Credits</th><th>Suite</th></tr></thead>
          <tbody>
            {usage.map((u, i) => (
              <tr key={i} className="border-t border-slate-800">
                <td>{u.timestamp_et}</td><td>{u.email}</td><td>{u.action}</td><td>{u.credits}</td><td>{u.suite}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}