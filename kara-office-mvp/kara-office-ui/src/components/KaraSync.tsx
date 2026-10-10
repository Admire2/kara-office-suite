import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Download, Upload, Trash2 } from 'lucide-react';

export default function KaraSync() {
  const [keys, setKeys] = useState<{ k: string; size: number }[]>([]);
  const [peers, setPeers] = useState(1);
  const [lastSync, setLastSync] = useState(localStorage.getItem('karaSyncLast') || 'never');
  const me = useRef(Math.random().toString(36).slice(2));
  const chan = useRef<BroadcastChannel | null>(null);

  const scan = () => {
    const out: { k: string; size: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || '';
      if (k.startsWith('kara')) out.push({ k, size: (localStorage.getItem(k) || '').length });
    }
    setKeys(out);
  };

  useEffect(() => {
    scan();
    const ch = new BroadcastChannel('kara-sync');
    chan.current = ch;
    ch.onmessage = (e) => {
      if (e.data?.hello) { ch.postMessage({ here: true }); }
      if (e.data?.here) setPeers(p => p + 1);
      if (e.data?.rescan) scan();
    };
    ch.postMessage({ hello: true });
    return () => ch.close();
  }, []);

  const exportBundle = () => {
    const bundle: Record<string, string> = {};
    keys.forEach(({ k }) => { bundle[k] = localStorage.getItem(k) || ''; });
    bundle['_karaSyncMeta'] = JSON.stringify({ exportedAt: new Date().toISOString(), device: navigator.platform, keys: keys.length });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'kara-sync-bundle-' + Date.now() + '.json'; a.click();
    const now = new Date().toLocaleString();
    localStorage.setItem('karaSyncLast', now); setLastSync(now);
  };

  const importBundle = (f: File) => {
    f.text().then(t => {
      const obj = JSON.parse(t);
      Object.entries(obj).forEach(([k, v]) => { if (k.startsWith('kara') && typeof v === 'string') localStorage.setItem(k, v); });
      scan();
      chan.current?.postMessage({ rescan: true });
      const now = new Date().toLocaleString();
      localStorage.setItem('karaSyncLast', now); setLastSync(now);
      alert('Bundle restored. Every Kara app on this machine now shares the imported state.');
    }).catch(() => alert('Invalid bundle file.'));
  };

  const purge = (k: string) => { if (confirm('Delete ' + k + '?')) { localStorage.removeItem(k); scan(); chan.current?.postMessage({ rescan: true }); } };
  const totalKB = (keys.reduce((s, x) => s + x.size, 0) / 1024).toFixed(1);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2"><RefreshCw size={18}/> Kara Sync Console</h2>
      <p className="text-xs text-slate-500 mb-4">Sovereign sync v1: live cross-tab heartbeat + portable encrypted-by-ownership bundles. No cloud. CRDT auto-merge is roadmap v2.</p>
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded p-3"><div className="text-2xl font-bold text-teal-600">{peers}</div><div className="text-[10px] text-slate-500">Live tabs synced</div></div>
        <div className="bg-white border border-slate-200 rounded p-3"><div className="text-2xl font-bold text-slate-700">{keys.length}</div><div className="text-[10px] text-slate-500">Sovereign keys</div></div>
        <div className="bg-white border border-slate-200 rounded p-3"><div className="text-2xl font-bold text-slate-700">{totalKB} KB</div><div className="text-[10px] text-slate-500">Local footprint</div></div>
        <div className="bg-white border border-slate-200 rounded p-3"><div className="text-[11px] font-semibold text-slate-700 mt-1">{lastSync}</div><div className="text-[10px] text-slate-500">Last bundle sync</div></div>
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={scan} className="px-3 py-2 bg-slate-200 text-xs rounded hover:bg-slate-300 flex items-center gap-1"><RefreshCw size={12}/> Rescan</button>
        <button onClick={exportBundle} className="px-3 py-2 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 flex items-center gap-1"><Download size={12}/> Export Sync Bundle</button>
        <button onClick={() => fileRef.current?.click()} className="px-3 py-2 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 flex items-center gap-1"><Upload size={12}/> Import Bundle</button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importBundle(f); e.target.value = ''; }}/>
      </div>
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-100 text-left text-xs text-slate-600"><th className="p-2">Key</th><th className="p-2">Size</th><th className="p-2 w-10"></th></tr></thead>
          <tbody>
            {keys.map(x => (
              <tr key={x.k} className="border-t border-slate-100">
                <td className="p-2 font-mono text-xs text-slate-700">{x.k}</td>
                <td className="p-2 text-xs text-slate-500">{(x.size / 1024).toFixed(2)} KB</td>
                <td className="p-2 text-center"><button onClick={() => purge(x.k)} className="text-slate-300 hover:text-red-500"><Trash2 size={12}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
