"use client";
import { useState } from "react";
import Link from "next/link";
import WalletBar from "@/components/WalletBar";
import { useWallet } from "@/components/useWallet";

const CATEGORIES = [
  { name: "PCB Fabrication", desc: "Turn Maxi designs into physical boards (incl. flex / rigid-flex)" },
  { name: "Component Sourcing", desc: "Find parts, alternates, handle shortages and surplus" },
  { name: "SMT Assembly", desc: "Populate boards with components" },
  { name: "Box Build / Final Assembly", desc: "Enclosures, wiring, testing" },
  { name: "Certification & Testing", desc: "FCC, CE, UL, ISO 13485, IPC Class 3 compliance" },
  { name: "CAD / eCAD Conversion", desc: "Turn Maxi sheets into DWG, KiCad, Altium files for contract compliance" },
  { name: "Contract Manufacturing", desc: "Full-service production runs, local or overseas" },
];

export default function PartnersPage() {
  const { spend } = useWallet();
  const [f, setF] = useState({ category: "", company: "", email: "", location: "", certifications: "", turnaround: "", moq: "", capabilities: "", role: "vendor" });

  const submit = async () => {
    if (!f.category || !f.company || !f.email) { alert("Fill category, company and email"); return; }
    const ok = await spend(50);
    if (!ok) return;
    try {
      await fetch("/api/maxi-partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      alert("Application submitted! We review and contact you within 48 hours.");
      setF({ category: "", company: "", email: "", location: "", certifications: "", turnaround: "", moq: "", capabilities: "", role: "vendor" });
    } catch (e) { alert("Submission failed - try again"); }
  };

  const inp = "w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm outline-none focus:border-emerald-400";
  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <WalletBar />
      <div className="max-w-4xl mx-auto">
        <Link href="/suite/maxi" className="text-cyan-400 hover:underline text-sm">&larr; Back to Maxi</Link>
        <h1 className="mt-4 text-3xl font-bold">🤝 Maxi Partners Directory</h1>
        <p className="mt-2 text-sm text-slate-400">Certified fabricators, assemblers, suppliers and manufacturers who accept Maxi designs. Founding partners (first 10) get 0% commission for 6 months.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((c) => (
            <div key={c.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-bold text-cyan-300">{c.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <h2 className="text-xl font-bold text-emerald-300">Apply to Join the FP Supply Chain Framework (50 credits)</h2>
          <p className="mt-1 text-xs text-slate-400">Vendors get leads. Designers & techs become <strong>supply-chain eligible</strong>: first pool for contracts, hires and revenue-share when FounderPilot opens its factories. Clients get priority production slots.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={inp}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className={inp}>
              <option value="vendor">Join as: Vendor / Manufacturer</option>
              <option value="designer">Join as: Designer (supply-chain eligible)</option>
              <option value="tech">Join as: Certified Tech / Assembler (eligible)</option>
              <option value="client">Join as: Client-Buyer (eligible for production slots)</option>
            </select>
            <input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="Company name" className={inp} />
            <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Contact email" className={inp} />
            <input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Location (local / overseas)" className={inp} />
            <input value={f.certifications} onChange={(e) => setF({ ...f, certifications: e.target.value })} placeholder="Certifications (ISO 13485, IPC Class 3...)" className={inp} />
            <input value={f.turnaround} onChange={(e) => setF({ ...f, turnaround: e.target.value })} placeholder="Typical turnaround (e.g. 6-8 days)" className={inp} />
            <input value={f.moq} onChange={(e) => setF({ ...f, moq: e.target.value })} placeholder="MOQ / capacity" className={inp} />
            <textarea value={f.capabilities} onChange={(e) => setF({ ...f, capabilities: e.target.value })} rows={3} placeholder="Capabilities, surplus handling, mass production experience" className={inp + " md:col-span-2"} />
          </div>
          <button onClick={submit} className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400">Submit Application (-50 credits)</button>
        </div>
      </div>
    </main>
  );
}