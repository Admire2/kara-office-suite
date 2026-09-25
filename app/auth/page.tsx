"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export default function Auth() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [me, setMe] = useState("");
  const [next, setNext] = useState("/suite");
  const router = useRouter();
  useEffect(() => {
    try { setNext(new URLSearchParams(window.location.search).get("next") || "/suite"); } catch (e) {}
    sb.auth.getSession().then(({ data }: any) => { if (data && data.session) setMe(data.session.user.email || ""); });
  }, []);
  const submit = async () => {
    if (!email.trim() || !pw.trim()) { setMsg("Enter your email and a password (6+ characters)."); return; }
    setBusy(true); setMsg("");
    try {
      if (mode === "in") {
        const { error } = await sb.auth.signInWithPassword({ email: email, password: pw });
        if (error) setMsg(String(error.message));
        else { setMsg("Signed in! Taking you back..."); setTimeout(() => router.push(next), 700); }
      } else {
        const { data, error } = await sb.auth.signUp({ email: email, password: pw, options: { emailRedirectTo: window.location.origin + next } });
        if (error) setMsg(String(error.message));
        else if (data.user && !data.session) setMsg("Account created! Check your inbox and click the confirmation link to activate it, then sign in here.");
        else { setMsg("Account created and signed in!"); setTimeout(() => router.push(next), 700); }
      }
    } catch (e) { setMsg("Connection error."); }
    setBusy(false);
  };
  const inp = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900";
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-6 shadow-2xl">
        <Link href={next} className="text-xs font-bold text-slate-500 hover:underline">← Back</Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">🔐 FounderPilot Account</h1>
        <p className="mt-1 text-xs text-slate-500">One account for every suite: KaraKata Market, iLera Healthcare, Engineering, Business and Nutrition.</p>
        {me && (<div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-700">Signed in as {me} · <button onClick={() => { sb.auth.signOut(); setMe(""); setMsg("Signed out."); }} className="underline">sign out</button></div>)}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => setMode("in")} className={"rounded-lg px-3 py-2 text-sm font-bold " + (mode === "in" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")}>Sign In</button>
          <button onClick={() => setMode("up")} className={"rounded-lg px-3 py-2 text-sm font-bold " + (mode === "up" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")}>Create Account</button>
        </div>
        <p className="mt-4 text-[11px] font-bold text-slate-600">Email</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={"mt-1 " + inp} placeholder="you@email.com" />
        <p className="mt-3 text-[11px] font-bold text-slate-600">Password</p>
        <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" className={"mt-1 " + inp} placeholder="6+ characters" />
        <button onClick={submit} disabled={busy} className="mt-4 w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50">{busy ? "Working..." : mode === "in" ? "Sign In" : "Create Account & Send Confirmation"}</button>
        {msg && (<p className={"mt-3 text-xs font-bold " + (msg.indexOf("!") === msg.length - 1 || msg.indexOf("Taking") >= 0 ? "text-emerald-700" : "text-rose-700")}>{msg}</p>)}
        {mode === "up" && (<p className="mt-3 text-[11px] text-slate-500">We email a confirmation link to verify you own this address - the same standard Amazon, eBay and Shopify use. Your credits, listings and orders attach to this account.</p>)}
      </div>
    </main>
  );
}
