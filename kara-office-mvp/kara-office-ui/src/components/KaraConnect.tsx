import { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Play } from 'lucide-react';

type Rule = { id: string; triggerApp: string; triggerEvent: string; actionApp: string; actionType: string; active: boolean };
const KEY = 'karaConnectRules';

export default function KaraConnect() {
  const [rules, setRules] = useState<Rule[]>(() => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } });
  const [form, setForm] = useState({ triggerApp: 'Kara Mail', triggerEvent: 'Email Received', actionApp: 'Kara Calendar', actionType: 'Create Event' });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(rules)); }, [rules]);

  const addRule = () => { setRules([...rules, { id: Date.now().toString(36), ...form, active: true }]); };
  const toggle = (id: string) => setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const del = (id: string) => setRules(rules.filter(r => r.id !== id));

  return (
    <div className="h-full flex flex-col bg-slate-50 p-6 max-w-4xl mx-auto w-full">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Zap className="text-amber-500"/> Kara Connect (Sovereign Automation)</h2>
      <p className="text-sm text-slate-500 mb-6">Build local workflows. No cloud webhooks. Triggers fire instantly within the browser.</p>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Create New Rule</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-slate-600">When</span>
          <select value={form.triggerApp} onChange={e => setForm(p => ({ ...p, triggerApp: e.target.value }))} className="border border-slate-200 rounded px-2 py-1.5 text-sm">
            <option>Kara Mail</option><option>Kara Base</option><option>Kara Calendar</option>
          </select>
          <select value={form.triggerEvent} onChange={e => setForm(p => ({ ...p, triggerEvent: e.target.value }))} className="border border-slate-200 rounded px-2 py-1.5 text-sm">
            <option>Email Received</option><option>Record Created</option><option>Event Scheduled</option>
          </select>
          <span className="text-sm font-medium text-slate-600">Then</span>
          <select value={form.actionApp} onChange={e => setForm(p => ({ ...p, actionApp: e.target.value }))} className="border border-slate-200 rounded px-2 py-1.5 text-sm">
            <option>Kara Calendar</option><option>Kara Base</option><option>Kara Flow</option><option>Kara Intelligence</option>
          </select>
          <select value={form.actionType} onChange={e => setForm(p => ({ ...p, actionType: e.target.value }))} className="border border-slate-200 rounded px-2 py-1.5 text-sm">
            <option>Create Event</option><option>Create Record</option><option>Create Task</option><option>Publish Artifact</option>
          </select>
          <button onClick={addRule} className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 flex items-center gap-1"><Plus size={14}/> Save Rule</button>
.
        </div>
      </div>

      <div className="space-y-3">
        {rules.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No automation rules yet.</p>}
        {rules.map(r => (
          <div key={r.id} className={`bg-white p-4 rounded-lg border flex items-center justify-between ${r.active ? 'border-amber-200 shadow-sm' : 'border-slate-200 opacity-60'}`}>
            <div className="flex items-center gap-3 text-sm">
              <Zap size={16} className={r.active ? 'text-amber-500' : 'text-slate-400'} />
              <span className="font-medium">When <span className="text-indigo-600">{r.triggerApp}</span> {r.triggerEvent.toLowerCase()}</span>
              <span className="text-slate-400">→</span>
              <span className="font-medium"><span className="text-indigo-600">{r.actionApp}</span> will {r.actionType.toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggle(r.id)} className="p-2 text-slate-400 hover:text-amber-600" title={r.active ? 'Disable' : 'Enable'}><Play size={16} className={r.active ? 'text-amber-500' : ''}/></button>
              <button onClick={() => del(r.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
