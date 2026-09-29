"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AgentRunnerPage() {
  const params = useParams();
  const tool = String(params.tool || "");
  const [agent, setAgent] = useState<any>(null);
  const [input, setInput] = useState("");
  const [fields, setFields] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/karakata/kaws/agents").then(r => r.json()).then(j => {
      if (j.ok) setAgent(j.agents.find((a: any) => a.id === tool) || null);
    });
  }, [tool]);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setOutput(null);
    const res = await fetch("/api/karakata/kaws/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: tool, input, fields })
    });
    const j = await res.json();
    if (j.ok) setOutput(j.output); else setError(j.error || "Failed");
    setLoading(false);
  };

  if (!agent) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-3xl font-bold">Coming Soon</h1>
        <Link href="/kaws/real-estate" className="mt-6 px-6 py-3 bg-indigo-600 rounded-lg font-semibold">← Back to Suite</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="max-w-3xl mx-auto mb-8">
        <div className="text-sm font-bold tracking-widest text-emerald-400 uppercase mb-2">KAWS Live Agent</div>
        <h1 className="text-4xl font-bold">{agent.icon} {agent.name}</h1>
        <p className="text-slate-400 mt-2">{agent.blurb}</p>
      </header>

      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
        <form onSubmit={run} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 h-fit">
          {agent.fields ? (
            agent.fields.map((fd: any) => (
              <div key={fd.key}>
                <label className="block text-xs text-slate-400 mb-1">{fd.label}</label>
                <input type="number" value={fields[fd.key] || ""} onChange={e => setFields({ ...fields, [fd.key]: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              </div>
            ))
          ) : (
            <div>
              <label className="block text-xs text-slate-400 mb-1">{agent.inputLabel}</label>
              <textarea rows={6} value={input} onChange={e => setInput(e.target.value)} placeholder={agent.placeholder} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
            </div>
          )}
          <button disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold disabled:opacity-50">
            {loading ? "Kara is working..." : "Run " + agent.name}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[300px]">
          <h2 className="text-lg font-bold mb-4">Result</h2>
          {!output && <p className="text-slate-500 text-sm">Output appears here.</p>}
          {output && (
            <div className="space-y-3 text-sm">
              {Object.entries(output).map(([k, v]: any) => (
                <div key={k} className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs font-bold text-indigo-300 uppercase mb-1">{k.replace(/_/g, " ")}</div>
                  <pre className="whitespace-pre-wrap text-slate-200 text-xs font-sans">{typeof v === "string" ? v : JSON.stringify(v, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}