"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AffiliateDashboard() {
  const [user,setUser]=useState<any>(null); const [origin,setOrigin]=useState("");
  const [aff,setAff]=useState<any>(null); const [refs,setRefs]=useState<any[]>([]);
  const [allAff,setAllAff]=useState<any[]>([]); const [payouts,setPayouts]=useState<any[]>([]);
  const [loading,setLoading]=useState(true); const [copied,setCopied]=useState(false);
  const [amount,setAmount]=useState(50); const [method,setMethod]=useState("paypal");
  const [dest,setDest]=useState(""); const [busy,setBusy]=useState(false);

  useEffect(()=>{ setOrigin(window.location.origin);
    (async()=>{ const {data:{session}}=await supabase.auth.getSession();
      if(session?.user){ setUser(session.user); await loadAll(session.user.email); }
      setLoading(false); })(); },[]);

  const loadAll = async (email:string) => {
    const {data}=await supabase.from("affiliates").select("*").eq("email",email).limit(1);
    if(data&&data.length>0){ setAff(data[0]);
      const {data:r}=await supabase.from("referrals").select("*").eq("affiliate_code",data[0].affiliate_code).order("created_at",{ascending:false}); setRefs(r||[]);
      const {data:p}=await supabase.from("payouts").select("*").eq("affiliate_code",data[0].affiliate_code).order("id",{ascending:false}); setPayouts(p||[]); }
    const {data:all}=await supabase.from("affiliates").select("*"); setAllAff(all||[]);
  };

  const join = async () => {
    const code=user.email.split("@")[0].replace(/[^a-z0-9]/gi,"-").toLowerCase();
    const m=document.cookie.match(/(^| )fp_ref=([^;]+)/); const ref=m?decodeURIComponent(m[2]):"";
    let parent:any=null;
    if(ref){ const {data}=await supabase.from("affiliates").select("affiliate_code").eq("affiliate_code",ref).limit(1); if(data&&data.length>0) parent=ref; }
    const etNow=new Date().toLocaleString("en-US",{timeZone:"America/New_York",hour12:false});
    const {error}=await supabase.from("affiliates").insert({email:user.email,affiliate_code:code,commission_rate:20,parent_code:parent,created_at_et:etNow});
    if(!error) await loadAll(user.email); else alert(error.message);
  };

  const requestPayout = async () => {
    const available=Number(aff.total_earned||0)-Number(aff.paid_out||0);
    if(amount<50){ alert("Minimum payout is $50"); return; }
    if(amount>available){ alert("Exceeds available balance ($"+available.toFixed(2)+")"); return; }
    if(!dest.trim()){ alert("Enter payout destination (PayPal email / US bank+routing / Wise / crypto address)"); return; }
    setBusy(true);
    const etNow=new Date().toLocaleString("en-US",{timeZone:"America/New_York",hour12:false});
    const {error}=await supabase.from("payouts").insert({affiliate_code:aff.affiliate_code,email:user.email,amount,method,destination:dest,status:"pending",requested_at_et:etNow});
    if(!error){ await supabase.from("affiliates").update({paid_out:Number(aff.paid_out||0)+amount}).eq("affiliate_code",aff.affiliate_code); await loadAll(user.email); }
    else alert(error.message);
    setBusy(false);
  };

  const kids=(code:string)=>allAff.filter(a=>a.parent_code===code);
  const countDown=(code:string):number=>kids(code).reduce((n,k)=>n+1+countDown(k.affiliate_code),0);
  const renderTree=(code:string,depth:number):any=>{
    const a=allAff.find(x=>x.affiliate_code===code)||{} as any;
    return (<div key={code} style={{marginLeft:depth*22}}>
      <div className="text-sm py-1">{depth>0?"└─ ":""}<span className="text-fuchsia-300 font-mono">{code}</span> <span className="text-slate-400">{a.email}</span> <span className="text-emerald-400">${Number(a.total_earned||0).toFixed(2)}</span></div>
      {kids(code).map(k=>renderTree(k.affiliate_code,depth+1))}
    </div>);
  };

  if(loading) return <div className="p-12 text-center text-white">Loading...</div>;
  if(!user) return <div className="p-12 text-center text-white">Please log in at /auth to view your affiliate dashboard.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-2">🤝 Affiliate Partner Dashboard</h1>
      <p className="text-slate-400 mb-8">Welcome, {user.email}</p>
      {!aff ? (
        <div className="max-w-md bg-slate-900 border border-fuchsia-500/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Become an Affiliate Partner</h2>
          <p className="text-slate-400 mb-6">Earn a share of the 20% commission pool on every sale in your downline (up to 5 levels).</p>
          <button onClick={join} className="bg-fuchsia-600 hover:bg-fuchsia-500 px-8 py-3 rounded-full font-bold">Join the Program</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          <div className="bg-slate-900 border border-fuchsia-500/30 rounded-xl p-6 md:col-span-2">
            <h2 className="text-xl font-bold text-fuchsia-300 mb-4">Your Unique Referral Link</h2>
            <div className="flex items-center gap-2">
              <input readOnly value={origin+"/?ref="+aff.affiliate_code} className="flex-1 p-3 bg-slate-800 rounded font-mono text-sm" />
              <button onClick={()=>{navigator.clipboard.writeText(origin+"/?ref="+aff.affiliate_code);setCopied(true);setTimeout(()=>setCopied(false),1500);}} className="bg-fuchsia-600 hover:bg-fuchsia-500 px-6 py-3 rounded font-bold">{copied?"✅ Copied!":"Copy"}</button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Pool: 20% per sale, split 50/25/15/7/3 across up to 5 levels. Settles 60 days after purchase.</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-6"><h2 className="text-lg font-bold mb-2">Total Signups</h2><p className="text-5xl font-black text-emerald-400">{refs.length}</p></div>
          <div className="bg-slate-900 rounded-xl p-6"><h2 className="text-lg font-bold mb-2">Lifetime Earned</h2><p className="text-5xl font-black text-fuchsia-400">${Number(aff.total_earned||0).toFixed(2)}</p><p className="text-xs text-slate-500 mt-2">Available: ${(Number(aff.total_earned||0)-Number(aff.paid_out||0)).toFixed(2)}</p></div>

          <div className="bg-slate-900 rounded-xl p-6 md:col-span-2">
            <h2 className="text-lg font-bold mb-4">💸 Request Payout (min $50)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input type="number" value={amount} onChange={e=>setAmount(+e.target.value)} className="p-2 bg-slate-800 rounded" />
              <select value={method} onChange={e=>setMethod(e.target.value)} className="p-2 bg-slate-800 rounded">
                <option value="paypal">PayPal</option><option value="wise">Wise</option><option value="us_bank">US Bank / Debit (ACH)</option><option value="crypto">Crypto</option>
              </select>
              <input value={dest} onChange={e=>setDest(e.target.value)} placeholder="PayPal email / bank+routing / address" className="p-2 bg-slate-800 rounded md:col-span-1" />
              <button onClick={requestPayout} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 rounded font-bold">{busy?"...":"Request"}</button>
            </div>
            {payouts.length>0 && (<table className="w-full text-sm mt-4"><thead><tr className="text-left text-fuchsia-300"><th>Amount</th><th>Method</th><th>Status</th><th>Requested (ET)</th></tr></thead><tbody>
              {payouts.map((p,i)=>(<tr key={i} className="border-t border-slate-800"><td>${Number(p.amount).toFixed(2)}</td><td>{p.method}</td><td>{p.status}</td><td>{p.requested_at_et}</td></tr>))}
            </tbody></table>)}
          </div>

          <div className="bg-slate-900 rounded-xl p-6 md:col-span-2">
            <h2 className="text-lg font-bold mb-2">🌳 Your Team ({countDown(aff.affiliate_code)} members below you)</h2>
            {renderTree(aff.affiliate_code,0)}
          </div>

          <div className="bg-slate-900 rounded-xl p-6 md:col-span-2">
            <h2 className="text-lg font-bold mb-4">Your Referred Users</h2>
            {refs.length===0?<p className="text-slate-500">No referrals yet. Share your link!</p>:(
            <table className="w-full text-sm"><thead><tr className="text-left text-fuchsia-300"><th>Email</th><th>Status</th><th>When (ET)</th></tr></thead><tbody>
              {refs.map((r,i)=>(<tr key={i} className="border-t border-slate-800"><td>{r.referred_email}</td><td>{r.status}</td><td>{r.timestamp_et}</td></tr>))}
            </tbody></table>)}
          </div>
        </div>
      )}
    </div>
  );
}