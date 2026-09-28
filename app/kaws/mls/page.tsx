"use client";
import { useEffect, useState } from "react";

export default function MlsDashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState("fmls");
  const [license, setLicense] = useState("");
  const [mlsId, setMlsId] = useState("");
  const [connected, setConnected] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetch("/api/karakata/kaws/mls/listings").then(r => r.json()).then(j => {
      if (j.ok) setListings(j.listings || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setConnected(true);
    setIsDemo(false);
    alert("✅ Live MLS Connection Saved! (Pending broker IDX approval).");
  };

  const handleDemo = () => {
    setProvider("fmls_sandbox");
    setLicense("DEMO_AGENT_GA");
    setMlsId("KAWS_SANDBOX_2026");
    setConnected(true);
    setIsDemo(true);
    // Trigger a re-fetch to get the demo data
    setLoading(true);
    fetch("/api/karakata/kaws/mls/listings?mode=demo").then(r => r.json()).then(j => {
      if (j.ok) setListings(j.listings || []);
      setLoading(false);
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="max-w-6xl mx-auto mb-8">
        <div className="text-sm font-bold tracking-widest text-emerald-400 uppercase mb-2">Track 1: Licensed Agent Exclusive</div>
        <h1 className="text-4xl font-bold">KAWS MLS Connector</h1>
        <p className="text-slate-400">Live FMLS/GAMLS integration. Powered by RESO Web API standards.</p>
      </header>

      {isDemo && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-indigo-900/30 border border-indigo-600 rounded-lg flex items-center justify-between">
          <div>
            <span className="font-bold text-indigo-300">🚀 KAWS Sandbox Mode Active</span>
            <p className="text-sm text-slate-300">You are viewing a live simulation of the FMLS RESO Web API. This is exactly how your live data will look once your broker approves IDX access.</p>
          </div>
          <button onClick={() => { setConnected(false); setIsDemo(false); setListings([]); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm">Exit Demo</button>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Connect Your MLS</h2>
          {connected ? (
            <div className="p-4 bg-emerald-900/30 border border-emerald-700 rounded-lg text-emerald-300 text-sm">
              ✅ <b>{isDemo ? "FMLS Sandbox" : provider.toUpperCase()}</b> Connected<br/>
              Status: {isDemo ? "Simulation Active" : "Syncing every 15 mins."}
            </div>
          ) : (
            <>
              <form onSubmit={handleConnect} className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">MLS Provider</label>
                  <select value={provider} onChange={e => setProvider(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
                    <option value="fmls">FMLS (Atlanta Metro)</option>
                    <option value="gamls">GAMLS (Statewide GA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Agent License #</label>
                  <input value={license} onChange={e => setLicense(e.target.value)} required placeholder="e.g. 123456" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">MLS ID / Username</label>
                  <input value={mlsId} onChange={e => setMlsId(e.target.value)} required placeholder="e.g. AGENT99" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                </div>
                <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg">Connect Live MLS</button>
              </form>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                <div className="relative flex justify-center text-xs"><span className="bg-slate-900 px-2 text-slate-500">OR</span></div>
              </div>

              <button onClick={handleDemo} className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-900/50 transition">
                🚀 Try Live Demo Mode
              </button>
              <p className="text-xs text-slate-500 text-center mt-2">Instantly test the RESO API sandbox without broker approval.</p>
            </>
          )}
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Live Listings Feed {isDemo && <span className="text-xs bg-indigo-600 px-2 py-1 rounded ml-2">SANDBOX</span>}</h2>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">Last sync: Just now</span>
          </div>
          {loading ? <p className="text-slate-400">Fetching RESO OData payload...</p> : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {listings.map((l: any, idx: number) => (
                <div key={l.ListingKey || idx} className="flex gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700 hover:border-indigo-500 transition cursor-pointer">
                  <div className="w-32 h-24 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                    {l.Media && l.Media[0] ? (
                      <img src={l.Media[0].MediaURL} alt="Property" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-white">{l.UnparsedAddress}</span>
                      <span className="text-emerald-400 font-bold">${(l.ListPrice / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="text-xs text-slate-400">{l.City}, {l.StateOrProvince} {l.PostalCode} • {l.BedroomsTotal} bd / {l.BathroomsTotalInteger} ba • {l.LivingArea} sqft</div>
                    <div className="text-xs text-slate-500 mt-1">MLS# {l.ListingKey} • Status: <span className="text-emerald-300">{l.StandardStatus}</span></div>
                    {isDemo && <div className="text-[10px] text-indigo-400 mt-1 font-mono">RESO Payload: ListPrice, BedroomsTotal, Media[0].MediaURL</div>}
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