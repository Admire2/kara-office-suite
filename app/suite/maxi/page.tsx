"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import WalletBar from "@/components/WalletBar";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";

const CHIPS = ["Size a buck converter 5V to 3.3V at 2A", "Decoupling plan for an ESP32-S3 board", "Trace width for 2A on 1oz copper", "Pick a 1A Li-ion charger IC with alternates"];
const DOMAINS = ["Auto-detect (recommended)", "PCB design & layout", "Power electronics & battery", "RF, antennas & telemetry", "Firmware & bring-up", "Component selection & sourcing", "EMC / EMI compliance", "Thermal & enclosure", "IoT & meshed devices", "Embedded AI & accelerators", "Robotics & motor control", "Industrial automation", "Audio & waveform", "Test & DFM"];
const SECTION_COLORS: any = { MATERIALS: "border-amber-400/40 bg-amber-500/10 text-amber-200", TOOLS: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200", STEPS: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200", TEST: "border-blue-400/40 bg-blue-500/10 text-blue-200", SAFETY: "border-red-400/40 bg-red-500/10 text-red-200", CONNECTIONS: "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200", "RED FLAGS": "border-red-400/50 bg-red-500/15 text-red-200", "AMBER NOTES": "border-amber-400/50 bg-amber-500/15 text-amber-200", "GREEN CHECKS": "border-emerald-400/50 bg-emerald-500/15 text-emerald-200", CHANGES: "border-blue-400/50 bg-blue-500/15 text-blue-200", ASSEMBLY: "border-emerald-400/50 bg-emerald-500/15 text-emerald-200", "MAXI — ELECTRONICS & HARDWARE": "border-cyan-400/50 bg-cyan-500/15 text-cyan-200", "RIVET — MECHANICAL": "border-slate-400/50 bg-slate-500/15 text-slate-200", "VOLT — ELECTRICAL POWER": "border-yellow-400/50 bg-yellow-500/15 text-yellow-200", "TERRA — CIVIL & STRUCTURAL": "border-green-400/50 bg-green-500/15 text-green-200", TIMELINE: "border-blue-400/50 bg-blue-500/15 text-blue-200", HANDOFFS: "border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-200" };
const TAG_COLORS: any = { POWER: "bg-red-500/20 text-red-300 border-red-500/40", IC: "bg-purple-500/20 text-purple-300 border-purple-500/40", PASSIVE: "bg-blue-500/20 text-blue-300 border-blue-500/40", PCB: "bg-green-500/20 text-green-300 border-green-500/40", MECH: "bg-slate-500/20 text-slate-300 border-slate-500/40", CONN: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40", RED: "bg-red-500/25 text-red-200 border-red-500/50", AMBER: "bg-amber-500/25 text-amber-200 border-amber-500/50", GREEN: "bg-emerald-500/25 text-emerald-200 border-emerald-500/50" };

function sectionRows(text: string, name: string) {
  const lines = text.split("\n");
  let on = false; const out: any[] = [];
  for (const l of lines) {
    const t = l.trim();
    const h = t.replace(/^[\s\*]+/, "");
    if (h.indexOf("## ") === 0) { on = h.replace("## ", "").toUpperCase().indexOf(name) === 0; continue; }
    if (on && t.indexOf("->") > 0 && t.length < 140) {
      const cl = t.replace(/^[\s\d\.\-\*]+/, "").replace(/\*\*/g, "");
      const m = cl.match(/^(.*?)\s*->\s*(.*?)\s*:\s*(.*)$/);
      if (m) out.push({ a: m[1].replace(/\*/g, "").slice(0, 28), b: m[2].replace(/\*/g, "").slice(0, 28), label: m[3].replace(/\*/g, "").slice(0, 40) });
    }
  }
  return out;
}

function connRows(text: string) {
  return text.split("\n").map((l) => l.trim().replace(/^-\s*/, "")).filter((l) => l.indexOf("->") > 0 && l.length < 140).map((l) => { const m = l.replace(/^[\s\d\.\-\*]+/, "").match(/^(.*?)\s*->\s*(.*?)\s*:\s*(.*)$/); return m ? { a: m[1].replace(/\*/g, "").slice(0, 28), b: m[2].replace(/\*/g, "").slice(0, 28), label: m[3].replace(/\*/g, "").slice(0, 40) } : null; }).filter(Boolean) as any[];
}

function blockRows(text: string) {
  const rows: string[][] = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    const toks = t.match(/\[([^\]]+)\]/g);
    if (toks && toks.length >= 2 && (t.indexOf("->") > 0 || t.indexOf("→") > 0)) rows.push(toks.map((x) => x.slice(1, -1).slice(0, 22)));
  }
  return rows;
}

function BlockDiagram({ rows }: { rows: string[][] }) {
  const W = 640, rowH = 46, boxH = 30;
  return (
    <svg viewBox={"0 0 " + W + " " + (rows.length * rowH + 8)} className="mt-2 w-full">
      {rows.map((toks, i) => {
        const y = i * rowH + 12;
        const n = toks.length;
        const boxW = Math.max(90, Math.min(180, (W - 40 - (n - 1) * 30) / n));
        return (
          <g key={i}>
            {toks.map((tk, j) => {
              const bx = 20 + j * (boxW + 30);
              return (
                <g key={j}>
                  <rect x={bx} y={y} width={boxW} height={boxH} rx={6} fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.5)" />
                  <text x={bx + 8} y={y + 19} fill="#a5f3fc" fontSize="10">{tk}</text>
                  {j < n - 1 && <line x1={bx + boxW} y1={y + 15} x2={bx + boxW + 30} y2={y + 15} stroke="#22d3ee" strokeWidth="2" />}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function Wiring({ rows }: { rows: any[] }) {
  const rowH = 52, W = 640, boxW = 210;
  const NET = ["#e879f9", "#22d3ee", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#f472b6", "#4ade80"];
  const netColor = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997; return NET[h % NET.length]; };
  const split = (s: string) => { const i = s.indexOf(":"); return i > 0 ? { c: s.slice(0, i), p: s.slice(i + 1) } : { c: s, p: "" }; };
  return (
    <svg viewBox={"0 0 " + W + " " + (rows.length * rowH + 8)} className="mt-2 w-full">
      {rows.map((r, i) => {
        const y = i * rowH + 20;
        const A = split(r.a), B = split(r.b);
        const nc = netColor(r.label);
        return (
          <g key={i}>
            <rect x={10} y={y} width={boxW} height={34} rx={6} fill="rgba(34,211,238,0.10)" stroke="rgba(34,211,238,0.5)" />
            <text x={20} y={y + 15} fill="#a5f3fc" fontSize="11" fontWeight="bold">{A.c}</text>
            {A.p !== "" && <text x={20} y={y + 28} fill="#67e8f9" fontSize="9">pin {A.p}</text>}
            <rect x={W - boxW - 10} y={y} width={boxW} height={34} rx={6} fill="rgba(52,211,153,0.10)" stroke="rgba(52,211,153,0.5)" />
            <text x={W - boxW} y={y + 15} fill="#a7f3d0" fontSize="11" fontWeight="bold">{B.c}</text>
            {B.p !== "" && <text x={W - boxW} y={y + 28} fill="#6ee7b7" fontSize="9">pin {B.p}</text>}
            <line x1={10 + boxW} y1={y + 17} x2={W - boxW - 10} y2={y + 17} stroke={nc} strokeWidth="2.5" />
            <circle cx={10 + boxW} cy={y + 17} r={3} fill={nc} />
            <circle cx={W - boxW - 10} cy={y + 17} r={3} fill={nc} />
            <text x={W / 2} y={y + 10} fill={nc} fontSize="10" textAnchor="middle" fontWeight="bold">{r.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function PcbPreview({ text }: { text: string }) {
  const names: string[] = [];
  const seen: any = {};
  for (const r of sectionRows(text, "CONNECTIONS")) {
    for (const s of [r.a, r.b]) {
      const c = s.split(":")[0].trim();
      if (!seen[c] && c.toUpperCase() !== "GND" && names.length < 24) { seen[c] = 1; names.push(c); }
    }
  }
  const n = Math.max(names.length, 1);
  const cols = Math.ceil(Math.sqrt(n));
  const cell = 92, bw = 62, bh = 40;
  const W = cols * cell + 60, Hh = Math.ceil(n / cols) * 82 + 60;
  return (
    <div className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-2">
      <svg viewBox={"0 0 " + W + " " + Hh} className="w-full">
        <rect x={8} y={8} width={W - 16} height={Hh - 16} rx={10} fill="#0d7a3f" stroke="#e8e8e8" strokeWidth="2" />
        {[[22, 22], [W - 22, 22], [22, Hh - 22], [W - 22, Hh - 22]].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={5} fill="#f7d774" stroke="#8a6d1a" />)}
        {names.map((nm, i) => {
          const cx = 34 + (i % cols) * cell + bw / 2, cy = 34 + Math.floor(i / cols) * 82 + bh / 2;
          return (
            <g key={nm}>
              <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh} rx={3} fill="#2b2b2b" stroke="#d9d9d9" strokeWidth="1" />
              <circle cx={cx - bw / 2 + 6} cy={cy - bh / 2 + 6} r={2} fill="#f7d774" />
              <text x={cx} y={cy + 3} fontSize="7" fill="#ffffff" textAnchor="middle">{nm.slice(0, 14)}</text>
              <text x={cx} y={cy + bh / 2 + 9} fontSize="6" fill="#e8e8e8" textAnchor="middle">SMT</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SchematicSheet({ text }: { text: string }) {
  const rows = sectionRows(text, "CONNECTIONS");
  if (!rows.length) return null;
  const split = (s: string) => { const i = s.indexOf(":"); return i > 0 ? { c: s.slice(0, i).trim(), p: s.slice(i + 1).trim() } : { c: s, p: "" }; };
  const comps: any = {}; const order: string[] = [];
  const ensure = (n: string) => { if (!comps[n]) { comps[n] = { left: [], right: [] }; order.push(n); } return comps[n]; };
  const wires: any[] = [];
  rows.forEach((r, idx) => {
    const A = split(r.a), B = split(r.b);
    const aG = (A.p + " " + A.c).toUpperCase().indexOf("GND") >= 0;
    const bG = (B.p + " " + B.c).toUpperCase().indexOf("GND") >= 0;
    const ca = ensure(A.c), cb = ensure(B.c);
    if (bG && !aG) { ca.right.push({ pin: A.p, gnd: true }); return; }
    if (aG && !bG) { cb.left.push({ pin: B.p, gnd: true }); return; }
    if (aG && bG) { ca.right.push({ pin: A.p, gnd: true }); cb.left.push({ pin: B.p, gnd: true }); return; }
    ca.right.push({ pin: A.p }); cb.left.push({ pin: B.p });
    wires.push({ ac: A.c, bc: B.c, ai: ca.right.length - 1, bi: cb.left.length - 1, label: r.label, idx: idx });
  });
  const colW = 350, boxW = 230, pinH = 16, cols = 2;
  const pos: any = {}; const rowHs: number[] = [];
  order.forEach((n, i) => {
    const c = comps[n];
    const pinsN = Math.max(c.left.length, c.right.length, 3);
    const h = pinsN * pinH + 26;
    const row = Math.floor(i / cols);
    pos[n] = { col: i % cols, row: row, h: h };
    rowHs[row] = Math.max(rowHs[row] || 0, h + 70);
  });
  const yOf = (row: number) => { let y = 16; for (let i = 0; i < row; i++) y += rowHs[i]; return y; };
  order.forEach((n) => { pos[n].x = 30 + pos[n].col * colW; pos[n].y = yOf(pos[n].row); });
  const H = yOf(rowHs.length) + 10, W = 30 + cols * colW + 10;
  const NET = ["#0a7a3a", "#b00020", "#0057b7", "#7a007a", "#b26a00", "#00727a", "#5a5a5a", "#c2417a"];
  const gndSym = (x: number, y: number, dir: number, key: string) => (
    <g key={key}>
      <line x1={x} y1={y} x2={x + 14 * dir} y2={y} stroke="#7a0000" strokeWidth="1.5" />
      <polygon points={(x + 14 * dir) + "," + (y - 5) + " " + (x + 14 * dir) + "," + (y + 5) + " " + (x + 22 * dir) + "," + y} fill="none" stroke="#7a0000" strokeWidth="1.5" />
      <text x={x + 26 * dir} y={y + 3} fontSize="8" fill="#7a0000" textAnchor={dir < 0 ? "end" : "start"}>GND</text>
    </g>
  );
  return (
    <div className="mt-2 overflow-x-auto rounded-lg bg-white p-2">
      <svg viewBox={"0 0 " + W + " " + H} className="w-full">
        {order.map((n) => {
          const p = pos[n]; const c = comps[n];
          return (
            <g key={n}>
              <rect x={p.x} y={p.y} width={boxW} height={p.h} rx={4} fill="#f8f8d8" stroke="#7a4a4a" strokeWidth="1.5" />
              <text x={p.x + boxW / 2} y={p.y + p.h - 6} fontSize="10" fontWeight="bold" fill="#333" textAnchor="middle">{n}</text>
              {c.left.map((pn: any, i: number) => {
                const y = p.y + 14 + i * pinH;
                return (
                  <g key={"l" + i}>
                    <text x={p.x + 6} y={y + 3} fontSize="8" fill="#444">{pn.pin}</text>
                    {pn.gnd ? gndSym(p.x, y, -1, "gl" + i) : <line x1={p.x - 10} y1={y} x2={p.x} y2={y} stroke="#0a7a3a" strokeWidth="1.5" />}
                  </g>
                );
              })}
              {c.right.map((pn: any, i: number) => {
                const y = p.y + 14 + i * pinH;
                return (
                  <g key={"r" + i}>
                    <text x={p.x + boxW - 6} y={y + 3} fontSize="8" fill="#444" textAnchor="end">{pn.pin}</text>
                    {pn.gnd ? gndSym(p.x + boxW, y, 1, "gr" + i) : <line x1={p.x + boxW} y1={y} x2={p.x + boxW + 10} y2={y} stroke="#0a7a3a" strokeWidth="1.5" />}
                  </g>
                );
              })}
            </g>
          );
        })}
        {wires.map((w) => {
          const pa = pos[w.ac], pb = pos[w.bc];
          if (!pa || !pb) return null;
          const ax = pa.x + boxW + 10, ay = pa.y + 14 + w.ai * pinH;
          const bx = pb.x - 10, by = pb.y + 14 + w.bi * pinH;
          const nc = NET[w.idx % NET.length];
          const mx = ax + 14;
          return (
            <g key={"w" + w.idx}>
              <path d={"M " + ax + " " + ay + " L " + mx + " " + ay + " L " + mx + " " + by + " L " + bx + " " + by} fill="none" stroke={nc} strokeWidth="1.5" />
              <text x={(ax + bx) / 2} y={Math.min(ay, by) - 4} fontSize="8" fill={nc} textAnchor="middle" fontWeight="bold">{w.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ReportView({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return null;
        const h = t.replace(/^[\s\*]+/, "");
        if (h.indexOf("## ") === 0) {
          const name = h.replace("## ", "").toUpperCase();
          const cls = SECTION_COLORS[name] || "border-white/10 bg-white/5 text-slate-200";
          return <div key={i} className={"mt-4 rounded-lg border px-3 py-2 text-sm font-bold " + cls}>{name}</div>;
        }
        if (t.indexOf("- ") === 0) {
          const tagMatch = t.match(/\[([A-Z]+)\]/);
          const tag = tagMatch ? tagMatch[1] : null;
          const rest = t.substring(2).replace(/\[[A-Z]+\]\s*/, "");
          return (
            <div key={i} className="flex items-start gap-2 pl-3 text-sm text-slate-200">
              {tag && <span className={"mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold " + (TAG_COLORS[tag] || "bg-white/10 text-slate-300 border-white/10")}>{tag}</span>}
              <span>{rest}</span>
            </div>
          );
        }
        if (/^STEP\s*\d/i.test(t)) {
          const stepNo = (t.match(/STEP\s*\d+/i) || ["STEP"])[0];
          return (
            <div key={i} className="flex items-start gap-2 pl-3 text-sm text-slate-100">
              <span className="mt-0.5 shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">{stepNo}</span>
              <span>{t.replace(/STEP\s*\d+:\s*/i, "")}</span>
            </div>
          );
        }
        return <p key={i} className="pl-3 text-sm text-slate-300">{t}</p>;
      })}
    </div>
  );
}

const scoreSuites = (q: any) => {
  const s = String(q || "").toLowerCase();
  const hits = (arr: any[]) => arr.reduce((n: any, k: any) => n + (s.indexOf(k) >= 0 ? 1 : 0), 0);
  const raw = [
    hits(["pcb", "firmware", "sensor", "mcu", "radio", "telemetry", "schematic", "component", "iot", "drone", "robot", "antenna", "camera"]),
    hits(["frame", "bracket", "enclosure", "gear", "mount", "cad", "stress", "material", "propeller", "mechanism", "housing", "drone", "robot", "arm", "chassis"]),
    hits(["battery", "power", "solar", "cable", "voltage", "current", "bms", "earthing", "panel", "amp", "drone", "robot", "motor", "charger"]),
    hits(["foundation", "concrete", "structural", "building", "mast", "tower", "seismic", "wind load", "drainage", "site", "bridge", "road", "roof"])
  ];
  const tot = raw[0] + raw[1] + raw[2] + raw[3];
  let pct = [30, 30, 30, 10];
  if (tot > 0) {
    pct = raw.map((x) => Math.round((x / tot) * 100));
    const diff = 100 - (pct[0] + pct[1] + pct[2] + pct[3]);
    pct[pct.indexOf(Math.max(pct[0], pct[1], pct[2], pct[3]))] += diff;
  }
  return pct;
};
export default function MaxiPage() { [...data.text.matchAll(/-\\s*\\$([\\d,]+)\\s*-\\s*(?:MAXI|RIVET|VOLT|TERRA)/g)].map(m => parseInt(m[1].replace(/,/g, ""), 10)); const s = cs.reduce((a, b) => a + b, 0); let t2 = s > 0 ? data.text.replace(/EST\\. BOM @1k:[^\\n]*/, "EST. BOM @1k: $" + s.toLocaleString()) : data.text; const sm = t2.match(/TEAM SPLIT:[^\\n]*?MAXI (\\d+)%[^\\n]*?RIVET (\\d+)%[^\\n]*?VOLT (\\d+)%[^\\n]*?TERRA (\\d+)%/); if (sm) { const a = +sm[1]; let b = +sm[2]; const c = +sm[3]; const d = +sm[4]; const tot = a + b + c + d; if (tot !== 100 && tot > 0) { b += 100 - tot; t2 = t2.replace(/TEAM SPLIT:[^\\n]*/, "TEAM SPLIT: MAXI " + a + "% / RIVET " + b + "% / VOLT " + c + "% / TERRA " + d + "%"); } } return t2; })() + "\\n\\n⚠️ PRELIMINARY TEARDOWN - NOT A QUOTE. Parts, materials and costs are AI estimates for guidance only (typical accuracy +/-30%). Not final, not verified, no warranty of fitness or accuracy. Use at your own risk. For binding numbers, order a Certified Partner review."); setAnswer("✅ PARTS LIST ready - your 01 BRIEF is now filled with the teardown. Press Start Designing below."); }
                  else setAnswer("❌ Analysis failed: " + (data.error || "Unknown error"));
                } catch (err: any) {
                  setAnswer("❌ Upload failed: " + err.message);
                }
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>
        01 · PROJECT BRIEF — the client&apos;s project / task</label>
        <textarea value={q} onChange={(e) => setQ(e.target.value)} rows={4} placeholder="Client project / task... e.g. Make me a temperature and humidity sensor node with WiFi and Bluetooth, powered by USB-C (5V), for consumer use." className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-4 text-sm outline-none focus:border-cyan-400" />
        <div className="mt-3 flex flex-wrap gap-2">
          {CHIPS.map((c) => <button key={c} onClick={() => { setQ(c); ask(c); }} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">⚡ {c}</button>)}
        </div>
        <p className="mt-1 text-[10px] text-slate-500">⚡ chips = quick ask (skips the plan). For the full 01→05 flow: write the brief + press Start Designing with Maxi.</p>

        <div className="mt-4 rounded-xl border-2 border-purple-500/40 bg-purple-500/5 p-4">
          <p className="text-sm font-bold text-purple-300">Project constraints — makes the design specific, not generic</p>
          <p className="mt-1 text-xs text-slate-400">Same pattern as Idea Validator & Business Model: brief + context = a tailored plan.</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            <input value={qbEnv} onChange={(e) => setQbEnv(e.target.value)} placeholder="Environment & use (e.g. outdoor industrial, medical, consumer indoor)" className={qbInput} />
            <input value={qbBudget} onChange={(e) => setQbBudget(e.target.value)} placeholder="Target unit cost (e.g. BOM under $15)" className={qbInput} />
            <input value={qbVolume} onChange={(e) => setQbVolume(e.target.value)} placeholder="Production volume (e.g. prototype / 100 / 10,000)" className={qbInput} />
            <input value={qbCerts} onChange={(e) => setQbCerts(e.target.value)} placeholder="Certifications (e.g. CE, FCC, UL, ISO 13485, IPC Class 3, none)" className={qbInput} />
          </div>
          <p className="mt-3 text-xs font-bold text-purple-300">What type of production do you need?</p>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
            {["Prototype", "Small batch", "Volume production", "Not sure yet"].map((p) => (
              <button key={p} onClick={() => setQbProd(p)} className={"rounded-lg border px-2 py-2 text-xs font-bold " + (qbProd === p ? "border-purple-400 bg-purple-500/30 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10")}>{p}</button>
            ))}
          </div>
          <button onClick={makePlan} disabled={planBusy} className="mt-3 w-full rounded-xl bg-purple-600 px-4 py-3 font-bold text-white hover:bg-purple-500 disabled:opacity-60">{planBusy ? "Maxi is planning..." : "🚀 Start Designing with Maxi (electronics only)"}</button>
        <p className="mt-1 text-[10px] text-slate-500">For drones, robots, power systems, buildings (projects needing mechanical + electrical + civil), use the 🤝 Team Plan button instead or after the plan appears.</p>
        </div>

        {plan && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
            <p className="text-sm font-bold text-emerald-300">💡 This looks like a multi-suite project (drones, robots, power systems, buildings need mechanical + electrical + civil too).</p>
            <button onClick={teamPlan} disabled={teamBusy} className="mt-2 w-full rounded-xl bg-emerald-500 px-4 py-2.5 font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">{teamBusy ? "Coordinating suites..." : "🤝 Get Team Plan — who does what + timeline to mass production"}</button>
          </div>
        )}

        {plan && (
          <div className="mt-4 rounded-xl border-2 border-fuchsia-500/50 bg-fuchsia-500/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-fuchsia-300">02 · PLAN — ready for your approval</p>
              <div className="flex gap-2">
                <button onClick={startFromPlan} disabled={plan.indexOf("#") < 0} className="rounded-full bg-fuchsia-600 px-5 py-2 text-sm font-bold text-white hover:bg-fuchsia-500 disabled:opacity-40">▶ Approve → 03 DESIGN</button>
                <button onClick={teamPlan} disabled={teamBusy} className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-40">{teamBusy ? "Coordinating..." : "🤝 Team Plan"}</button>
                <button onClick={() => setPlan("")} className="rounded-full border border-fuchsia-500/40 px-4 py-1.5 text-xs font-bold text-fuchsia-200 hover:bg-fuchsia-500/10">Clear</button>
              </div>
            </div>
            <div className="mt-3 whitespace-pre-wrap text-sm text-slate-200">{plan}</div>
            <p className="mt-2 text-[10px] text-slate-500">▶ Approve generates 03 DESIGN (required for KiCad / EasyEDA / DXF / PDF exports). 🤝 Team Plan gives the cross-suite collaboration card instead.</p>
          </div>
        )}

        {answer && (
          <div id="design-card" className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-cyan-300">03 · DESIGN — Maxi&apos;s Engineering Answer · Rev {String.fromCharCode(65 + rev)}</h3>
            <div className="mt-3 whitespace-pre-wrap text-sm text-slate-200">{answer}</div>
            <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
              <p className="text-xs font-bold text-red-300">⚠️ DRAFT DESIGN — NOT FINAL PRODUCT</p>
              <p className="mt-1 text-[11px] text-slate-400">This is an AI-generated engineering proposal, not a tested or validated product. <strong>Use at your own risk.</strong> FounderPilot provides no warranty of fitness, safety, or compliance. Before manufacturing: (1) prototype & test, (2) run ERC/DRC checks, (3) obtain compliance certification (CE/FCC/UL), (4) have a licensed engineer review. For certified validation, hire a <Link href="/suite/maxi/partners" className="text-emerald-300 underline">Certified Partner</Link>.</p>
            </div>
            {sectionRows(answer, "CONNECTIONS").length > 0 && (
              <div className="mt-4 rounded-xl border-2 border-cyan-400/40 bg-slate-900/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-cyan-300">🖥️ GRAPHICAL CONSOLE — auto-opens with 03 DESIGN</p>
                  <div className="flex gap-1">
                    {["SCH", "PCB", "ASM", "BLK"].map((t) => (
                      <button key={t} onClick={() => setGtab(t)} className={"rounded px-2 py-1 text-[10px] font-bold " + (gtab === t ? "bg-cyan-500 text-slate-950" : "bg-white/10 text-slate-300 hover:bg-white/20")}>{t}</button>
                    ))}
                  </div>
                </div>
                {gtab === "SCH" && <SchematicSheet text={answer} />}
                {gtab === "PCB" && <PcbPreview text={answer} />}
                {gtab === "ASM" && <Wiring rows={sectionRows(answer, "ASSEMBLY")} />}
                {gtab === "BLK" && <BlockDiagram rows={blockRows(answer)} />}
                <button onClick={downloadKicadPack} className="mt-2 w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/20">📦 Download KiCad-ready pack (DXF + CSVs + guide) → open in your KiCad</button>
              </div>
            )}
            {window.location.hash === "#admin" && <p className="mt-4 text-xs text-slate-500">🕐 Generated: {stamp}{provider ? " | ⚡ " + provider : ""}</p>}
            <button onClick={generateReport} disabled={reportBusy} className="mt-4 w-full rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40">{reportBusy ? "Building sheet..." : "📄 Generate Report (next step)"}</button>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              <button onClick={reviewDesign} disabled={reviewBusy} className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-200 hover:bg-red-500/20 disabled:opacity-40">{reviewBusy ? "Auditing..." : "🔍 Run Design Review (red-flag check)"}</button>
              <button onClick={() => setShowRev(!showRev)} className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-200 hover:bg-blue-500/20">✏️ Client objection? Request revision</button>
            </div>
            {showRev && (
              <div className="mt-3">
                <textarea value={revNote} onChange={(e) => setRevNote(e.target.value)} rows={2} placeholder="Client objection / change request... e.g. budget is $10 not $15, must support USB-C PD, needs IP67." className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm outline-none focus:border-blue-400" />
                <button onClick={requestRevision} className="mt-2 w-full rounded-xl bg-blue-500 px-4 py-2.5 font-bold text-slate-950 hover:bg-blue-400">Submit revision → Rev {String.fromCharCode(66 + rev)}</button>
              </div>
            )}
          </div>
        )}

        <button onClick={() => ask(q)} disabled={busy} className="mt-3 w-full rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50">{busy ? "Maxi is thinking..." : "⚡ Quick ask (skip the plan)"}</button>
        <button onClick={teamPlan} disabled={teamBusy || !q.trim()} className="mt-2 w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50">{teamBusy ? "Coordinating suites..." : "🤝 Team Plan — Maxi coordinates with Rivet / Volt / Terra"}</button>

        {team && (
          <div className="mt-6 rounded-xl border-2 border-emerald-400/40 bg-emerald-500/5 p-6">
            <h3 className="text-lg font-bold text-emerald-300">🤝 CROSS-SUITE COLLABORATION PLAN</h3>
            {teamShares.length > 0 && (
              <>
                <div className="mt-3 flex h-4 w-full overflow-hidden rounded-full border border-white/10">
                  {teamShares.map((s) => <div key={s.name} style={{ width: s.pct + "%", background: s.color }} />)}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-bold">
                  {teamShares.map((s) => <span key={s.name} style={{ color: s.color }}>{s.name} {s.pct}%</span>)}
                </div>
              </>
            )}
            <div className="mt-4"><ReportView text={team} /></div>
          </div>
        )}

        {review && (
          <div className="mt-6 rounded-xl border-2 border-red-400/40 bg-red-500/5 p-6">
            <h3 className="text-lg font-bold text-red-300">🔍 Independent Design Review</h3>
            <p className="mt-1 text-xs text-slate-400">A second engineer audits the design. RED = must fix before build. VERDICT line tells you if it is implementable.</p>
            <div className="mt-4"><ReportView text={review} /></div>
          </div>
        )}

        {report && (
          <div className="mt-6 rounded-xl border-2 border-amber-400/40 bg-amber-500/5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-amber-300">04 · 📋 Assembler Sheet & Exports</h3>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => downloadPdf().catch((e: any) => alert("PDF error: " + (e && e.message ? e.message : String(e))))} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400">⬇ Download PDF (final deliverable)</button>
                <button onClick={downloadDxf} className="rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30">📐 DXF</button>
                <button onClick={downloadBom} className="rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30">🧾 BOM.csv</button>
                <button onClick={downloadWires} className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/20 px-3 py-1.5 text-xs font-bold text-fuchsia-200 hover:bg-fuchsia-500/30">🔌 Wires.csv</button>
                <button onClick={downloadReport} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10">TXT</button>
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-400">Color-coded materials + step-by-step build guide for techs & assemblers.</p>
            <p className="mt-1 text-[11px] text-slate-500">Contract requires native CAD/eCAD (DWG, KiCad, Altium)? Export DXF + CSVs here, then hire a certified conversion partner: <Link href="/suite/maxi/partners" className="text-emerald-300 underline">Maxi Partners</Link>.</p>
            <div className="mt-4"><ReportView text={report} /></div>
            {sectionRows(report, "CONNECTIONS").length > 0 && (
              <div className="mt-4 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-3">
                <p className="text-xs font-bold text-fuchsia-300">🔌 SCHEMATIC SHEET — auto-layout (KiCad-style)</p>
                <SchematicSheet text={report} />
              </div>
            )}
            {sectionRows(report, "ASSEMBLY").length > 0 && (
              <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="text-xs font-bold text-emerald-300">🧩 ASSEMBLY DIAGRAM — how parts attach</p>
                <Wiring rows={sectionRows(report, "ASSEMBLY")} />
              </div>
            )}
          </div>
        )}

        <div className="mt-6 rounded-xl border-2 border-emerald-400/40 bg-emerald-500/5 p-6">
          <h3 className="text-lg font-bold text-emerald-300">05 · BUILD — choose your path</h3>
          <p className="mt-1 text-xs text-slate-400">Export the design into ANY eCAD (5 packs below) - or pick a build path further down: Partner Build / Free Tool / DIY.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => packFor("KiCad")} className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400">📦 Outputs → my KiCad</button>
            <button onClick={() => packFor("EasyEDA")} className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400">📦 Outputs → my EasyEDA</button>
            <button onClick={() => packFor("LibrePCB")} className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400">📦 Outputs → my LibrePCB</button>
            <button onClick={() => packFor("Altium")} className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400">📦 Outputs → my Altium</button>
            <button onClick={() => packFor("Eagle")} className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400">📦 Outputs → my Eagle</button>
            <button onClick={() => downloadPdf(true).catch((e: any) => alert("PDF error: " + (e && e.message ? e.message : String(e))))} className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400">🖨 DIY Print Pack (guide + full design sheet)</button>
              <p className="mt-1 w-full text-[10px] text-slate-400">📌 Note: Download PDF & DIY Print Pack unlock after 03 DESIGN / Generate Report appears.</p>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">These save straight to your Downloads folder (incognito included) - then copy into your eCAD project folder.</p>
          <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-2">
            <p className="text-[10px] font-bold text-slate-300">🧰 Client has their own eCAD? We speak every format (DXF + CSV import everywhere; native project files via certified partners):</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <a href="https://www.kicad.org/download/" target="_blank" rel="noreferrer" className="rounded-full border border-cyan-500/40 bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/30">KiCad — free download</a>
              <a href="https://easyeda.com" target="_blank" rel="noreferrer" className="rounded-full border border-cyan-500/40 bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/30">EasyEDA — browser</a>
              <a href="https://pro.easyeda.com" target="_blank" rel="noreferrer" className="rounded-full border border-cyan-500/40 bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/30">EasyEDA Pro</a>
              <a href="https://librepcb.org/download/" target="_blank" rel="noreferrer" className="rounded-full border border-cyan-500/40 bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/30">LibrePCB</a>
              <a href="https://www.autodesk.com/products/eagle/" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:bg-white/10">Eagle / Fusion</a>
              <a href="https://www.altium.com" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:bg-white/10">Altium</a>
              <a href="https://www.designspark.com/pcb" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:bg-white/10">DesignSpark</a>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="text-2xl">🏭</div>
              <h4 className="mt-2 font-bold text-emerald-200">Partner Build</h4>
              <p className="mt-1 text-xs text-slate-400">Certified fabricators handle everything. Fastest path to finished hardware.</p>
              <Link href="/suite/maxi/partners" className="mt-3 inline-block rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400">Find a Partner</Link>
            </div>
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
              <div className="text-2xl">🆓</div>
              <h4 className="mt-2 font-bold text-cyan-200">Free Tool Import</h4>
              <p className="mt-1 text-xs text-slate-400">Export DXF + BOM.csv + Wires.csv → import into free tools like KiCad or EasyEDA.</p>
              <div className="mt-3 flex flex-wrap gap-1">
                <a href="https://www.kicad.org" target="_blank" rel="noreferrer" className="rounded-full border border-cyan-500/40 bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/30">KiCad ↗</a>
                <a href="https://easyeda.com" target="_blank" rel="noreferrer" className="rounded-full border border-cyan-500/40 bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/30">EasyEDA ↗</a>
                <a href="https://librepcb.org" target="_blank" rel="noreferrer" className="rounded-full border border-cyan-500/40 bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/30">LibrePCB ↗</a>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">Tip: the 🖥️ console in 03 has a 📦 KiCad-ready pack (DXF + CSVs + import guide) for one-click handoff.</p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="text-2xl">🧪</div>
              <h4 className="mt-2 font-bold text-amber-200">DIY Home Etch</h4>
              <p className="mt-1 text-xs text-slate-400">Print the PDF sheet and etch a single-layer board at home. Simple circuits only.</p>
              <button onClick={() => setShowDiy(!showDiy)} className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30">{showDiy ? "Hide DIY Guide" : "DIY Guide"}</button>
              {showDiy && (
                <div className="mt-2">
                  <ol className="list-decimal pl-4 text-[11px] text-slate-300 space-y-1">
                    <li>Print the PDF sheet (04 card) at 100% scale.</li>
                    <li>Trace the circuit on copper-clad board with an etch-resistant marker (or photo-resist + transparency).</li>
                    <li>Submerge in ferric chloride 10-20 min, agitate gently.</li>
                    <li>Rinse, drill holes, solder components per the BOM.</li>
                    <li>Multimeter continuity check before first power-up.</li>
                  </ol>
                  <p className="mt-1 text-[10px] text-slate-500">Limitations: single-layer only, no DRC checks. Multi-layer or SMD-heavy → use Free Tool Import or Partner Build.</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-bold text-slate-300">🔎 Verify before production (free, once you have Gerbers from KiCad/EasyEDA):</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a href="https://www.jlcpcb.com/gerber-viewer" target="_blank" rel="noreferrer" className="rounded-full border border-cyan-500/40 bg-cyan-500/20 px-3 py-1 text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/30">JLCPCB Gerber Viewer</a>
              <a href="https://www.pcbway.com/project/gerber-viewer.html" target="_blank" rel="noreferrer" className="rounded-full border border-cyan-500/40 bg-cyan-500/20 px-3 py-1 text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/30">PCBWay Gerber Viewer</a>
              <a href="https://www.kicad.org" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-slate-300 hover:bg-white/10">KiCad (built-in 3D viewer)</a>
            </div>
          </div>
          <button onClick={generateVendors} disabled={vendorBusy || !answer} className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-40">{vendorBusy ? "Building vendor list..." : "🤝 Generate Vendor List (client-ready)"}</button>
          {vendor && (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <p className="text-sm font-bold text-emerald-300">🤝 Vendor Shortlist — {qbProd || "any production"}</p>
              <div className="mt-2"><ReportView text={vendor} /></div>
            </div>
          )}
          <p className="mt-4 text-[11px] text-slate-500">For complex designs (multi-layer, fine-pitch SMD), Partner Build or Free Tool Import is recommended. Manual etching is only practical for very simple circuits.</p>
        </div>
      </div>
    </main>
  );
}
