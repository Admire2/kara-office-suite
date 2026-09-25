"use client";
import { useState, useEffect } from "react";
export default function WalletBar() {
  const [bal, setBal] = useState<any>({ monthly: 0, pack: 0, loaded: false });
  useEffect(() => {
    let email = "";
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || "";
        if (k.indexOf("sb-") === 0 && k.indexOf("-auth-token") > 0) {
          const j = JSON.parse(localStorage.getItem(k) || "null");
          email = (j && j.user && j.user.email) || "";
          if (email) break;
        }
      }
    } catch (e) {}
    const parse = (j: any) => {
      if (!j) return null;
      const o = Array.isArray(j) ? j[0] : j;
      if (!o) return null;
      const m = o.monthly !== undefined ? o.monthly : o.balance;
      const p = o.pack !== undefined ? o.pack : o.pack_balance;
      if (m === undefined && p === undefined) return null;
      return { monthly: Number(m) || 0, pack: Number(p) || 0 };
    };
    const load = async () => {
      if (!email) { setBal({ monthly: 0, pack: 0, loaded: true }); return; }
      let got = null;
      try {
        const r = await fetch("/api/credits?email=" + encodeURIComponent(email));
        if (r.ok) got = parse(await r.json().catch(() => null));
      } catch (e) {}
      if (!got) {
        try {
          const r2 = await fetch("/api/credits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }) });
          if (r2.ok) got = parse(await r2.json().catch(() => null));
        } catch (e) {}
      }
      setBal(got ? { monthly: got.monthly, pack: got.pack, loaded: true } : { monthly: 0, pack: 0, loaded: true });
    };
    load();
    const iv = setInterval(load, 8000);
    const onVis = () => { if (!document.hidden) load(); };
    const onRefresh = () => { load(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("wallet-refresh", onRefresh);
    window.addEventListener("focus", load);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", load); window.removeEventListener("wallet-refresh", onRefresh); };
  }, []);
  const total = (bal.monthly || 0) + (bal.pack || 0);
  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-[10px] font-bold text-cyan-300">WALLET</p>
          <p className="text-lg font-bold text-white">{bal.loaded ? total : "--"} <span className="text-xs text-slate-400">credits</span></p>
        </div>
        <div className="hidden text-[10px] text-slate-400 md:block">
          <p>{bal.monthly || 0} monthly</p>
          <p>{bal.pack || 0} pack</p>
        </div>
      </div>
      <a href="/pricing#packs" className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400">Buy Credits</a>
    </div>
  );
}
