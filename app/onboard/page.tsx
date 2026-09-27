"use client";
import { useEffect, useState } from "react";

export default function OnboardPage() {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("real_estate");
  const [industries, setIndustries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/karakata/industries").then(r => r.json()).then(j => {
      if (j.ok && j.industries && j.industries.length) setIndustries(j.industries);
    }).catch(() => {});
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    try {
      const res = await fetch("/api/karakata/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: company, email, industry_id: industry })
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess("🎉 " + company + " is now live! Your Tenant ID is: " + data.tenant_id + ". Our team will assign your phone number shortly.");
      } else {
        setSuccess("Error: " + data.error);
      }
    } catch (err: any) {
      setSuccess("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-8 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Launch Your AI Receptionist</h1>
          <p className="text-slate-400 text-sm">Never miss a lead again. 12 industries. 5 languages. Setup in 30 seconds.</p>
        </header>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Company Name</label>
            <input required value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Akande Realty" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Owner Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="owner@company.com" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Industry</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white">
              {(industries.length ? industries : [{ id: "real_estate", name: "Real Estate" }]).map((i: any) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
          <button disabled={loading} type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Provisioning AI Agent..." : "Start $149/mo Trial"}
          </button>
        </form>

        {success && (
          <div className="p-3 bg-emerald-900/50 border border-emerald-700 rounded-lg text-emerald-200 text-sm text-center">{success}</div>
        )}
        <p className="text-center text-xs text-slate-500">Powered by FounderPilot AI Suite · Secure & Encrypted</p>
      </div>
    </main>
  );
}