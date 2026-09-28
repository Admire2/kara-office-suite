"use client";
import { useEffect, useState } from "react";

export default function MlsDashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState("fmls");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch("/api/karakata/kaws/mls/listings").then(r => r.json()).then(j => {
      if (j.ok) setListings(j.listings || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setConnected(true);
    alert("✅ MLS Connection Saved! (In production, this triggers the RESO Web API handshake with FMLS/GAMLS. Currently showing Atlanta Demo Feed).");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="max-w-6xl mx-auto mb-8">
        <div className="text-sm font-bold tracking-widest text-emerald-400 uppercase mb-2">Track 1: Licensed Agent Exclusive</div>
        <h1 className="text-4xl font-bold">KAWS MLS Connector</h1>
        <p className="text-slate-400">Live FMLS/GAMLS integration. Powered by RESO Web API standards.</p>
      </header>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Connect Your MLS</h2>
          {connected ? (
            <div className="p-4 bg-emerald-900/30 border border-emerald-700 rounded-lg text-emerald-300 text-sm">
              ✅ <b>{provider.toUpperCase()}</b> Connected<br/>Status: Syncing every 15 mins.
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">MLS Provider</label>
                <select value={provider} onChange={e => setProvider(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
                  <option value="fmls">FMLS (Atlanta Metro)</option>
                  <option value="gamlss">GAMLS (Statewide GA)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Agent License #</label>
                <input required placeholder="e.g. 123456" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">MLS ID / Username</label>
                <input required placeholder="e.g. AGENT99" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              </div>
              <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg">Connect & Sync</button>
            </form>
          )}
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Live Listings Feed</h2>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">Last sync: Just now</span>
          </div>
          {loading ? <p className="text-slate-400">Fetching listings...</p> : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {listings.map((l: any) => (
                <div key={l.mls_id} className="flex gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="w-24 h-16 bg-slate-700 rounded flex items-center justify-center text-2xl">🏠</div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-white">{l.address}</span>
                      <span className="text-emerald-400 font-bold">${(l.price / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="text-xs text-slate-400">{l.city}, {l.state} {l.zip} • {l.beds} bd / {l.baths} ba • {l.sqft} sqft</div>
                    <div className="text-xs text-slate-500 mt-1">MLS# {l.mls_id} • Status: <span className="text-emerald-300">{l.status}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}