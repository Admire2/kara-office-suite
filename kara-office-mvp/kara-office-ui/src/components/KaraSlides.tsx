import { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, ArrowUp, ArrowDown, Play, Download } from 'lucide-react';

type Slide = { id: number; layout: string; title: string; body: string };

const THEMES = [
  { name: 'Kara Dark', bg: '#0f172a', fg: '#f8fafc', accent: '#38bdf8' },
  { name: 'Kara Blue', bg: '#1e3a8a', fg: '#ffffff', accent: '#fbbf24' },
  { name: 'Clean White', bg: '#ffffff', fg: '#0f172a', accent: '#2563eb' },
  { name: 'Emerald', bg: '#064e3b', fg: '#ecfdf5', accent: '#34d399' },
  { name: 'Charcoal', bg: '#1f2937', fg: '#f9fafb', accent: '#f472b6' },
];

const LAYOUTS = [
  { id: 'title', name: 'Title Slide' },
  { id: 'content', name: 'Title + Content' },
  { id: 'big', name: 'Big Statement' },
  { id: 'blank', name: 'Blank / Custom' },
];

const DECK_CHIPS = [
  'Kara Office Suite overview: sovereign Word, Sheets, Slides and Notes with offline AI',
  'Kara Slides capabilities: layouts, themes, Present mode, HTML export, AI Deck Builder',
  'Kara Word advantage: offline grammar engine, ghost completion, zero telemetry',
  'Kara Sheets quant mode: Black-Scholes, Greeks and trade analyzer for any market',
  'Kara Seek on-prem agent: live research with anti-hallucination protocols',
  'Why sovereign office suites win: data ownership, no subscriptions, offline AI',
];

const esc = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

export default function KaraSlides({ seekReport }: { seekReport?: string }) {
  const [slides, setSlides] = useState<Slide[]>(() => {
    try { const s = localStorage.getItem('karaSlidesDeck'); if (s) return JSON.parse(s); } catch (e) {}
    return [{ id: 1, layout: 'title', title: 'Kara Slides', body: 'Sovereign presentations. No cloud. No subscription.' }];
  });
  const [activeId, setActiveId] = useState<number>(slides[0]?.id ?? 1);
  const [themeIdx, setThemeIdx] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const [presentIdx, setPresentIdx] = useState(0);
  const [deckPrompt, setDeckPrompt] = useState('');
  const [deckThinking, setDeckThinking] = useState(false);
  const [deckPhase, setDeckPhase] = useState('');

  useEffect(() => { localStorage.setItem('karaSlidesDeck', JSON.stringify(slides)); }, [slides]);
  useEffect(() => { if (seekReport && seekReport.trim()) localStorage.setItem('karaSeekLastReport', seekReport); }, [seekReport]);

  const theme = THEMES[themeIdx];
  const active = slides.find(s => s.id === activeId) || slides[0];
  const activeIdx = slides.findIndex(s => s.id === activeId);

  const update = (patch: Partial<Slide>) => setSlides(slides.map(s => s.id === activeId ? { ...s, ...patch } : s));
  const addSlide = () => { const id = Date.now(); setSlides([...slides, { id, layout: 'content', title: 'New Slide', body: '- Point one\n- Point two' }]); setActiveId(id); };
  const dupSlide = () => { if (!active) return; const id = Date.now(); const arr = [...slides]; arr.splice(activeIdx + 1, 0, { ...active, id }); setSlides(arr); setActiveId(id); };
  const delSlide = () => { if (slides.length <= 1) return; const arr = slides.filter(s => s.id !== activeId); setSlides(arr); setActiveId(arr[Math.max(0, activeIdx - 1)].id); };
  const move = (dir: number) => { const j = activeIdx + dir; if (j < 0 || j >= slides.length) return; const arr = [...slides]; const t = arr[activeIdx]; arr[activeIdx] = arr[j]; arr[j] = t; setSlides(arr); };

  useEffect(() => {
    if (!presenting) return;
    const kd = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') setPresentIdx(i => Math.min(slides.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setPresentIdx(i => Math.max(0, i - 1));
      if (e.key === 'Escape') setPresenting(false);
    };
    window.addEventListener('keydown', kd);
    return () => window.removeEventListener('keydown', kd);
  }, [presenting, slides.length]);

  const buildDeck = async () => {
    const topic = deckPrompt.trim();
    if (!topic) { alert('Type a deck topic first, or click one of the sample chips.'); return; }
    setDeckThinking(true);
    setDeckPhase('research');
    let research = '';
    try {
      const r = await fetch('http://localhost:3001/api/seek', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goal: topic + '\nReturn a concise factual brief (max 400 words) with concrete numbers, dates and names from live sources only.' }) });
      const rd = await r.json();
      if (rd && rd.success) research = rd.answer || '';
    } catch (e) { research = ''; }
    setDeckPhase('build');
    const prompt = 'You are Kara Slides Deck Builder. ' +
      (research ? 'Use ONLY the research brief below as your factual source.\n\nRESEARCH BRIEF:\n' + research.substring(0, 4000) + '\n\n' : '') +
      'Create a presentation about: ' + topic +
      '\nReturn ONLY lines in this exact format:\nSLIDE: <slide title>\nBODY: <bullet one> | <bullet two> | <bullet three>\nMake exactly 6 slides. No extra text.';
    try {
      const res = await fetch('http://localhost:11434/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'qwen2.5:3b', prompt, stream: false }) });
      const d = await res.json();
      const lines = (d.response || '').split('\n');
      const deck: Slide[] = [];
      let cur: Slide | null = null;
      lines.forEach(ln => {
        const t = ln.trim();
        if (t.toUpperCase().startsWith('SLIDE:')) {
          cur = { id: Date.now() + deck.length, layout: deck.length === 0 ? 'title' : 'content', title: t.substring(6).trim(), body: '' };
          deck.push(cur);
        } else if (t.toUpperCase().startsWith('BODY:') && cur) {
          cur.body = t.substring(5).split('|').map(b => b.trim()).filter(Boolean).map(b => '- ' + b).join('\n');
        }
      });
      if (deck.length) { setSlides(deck); setActiveId(deck[0].id); }
      else { setSlides([{ id: Date.now(), layout: 'content', title: topic, body: (research || d.response || '').substring(0, 500) }]); }
    } catch (e) { alert('Kara Local engine offline. Start Ollama.'); }
    setDeckThinking(false); setDeckPhase('');
  };

  const buildFromReport = async () => {
    const report = (seekReport && seekReport.trim()) ? seekReport : (localStorage.getItem('karaSeekLastReport') || '');
    if (!report) { alert('No Kara Seek report yet. Run a mission in the Seek panel first, then click this button.'); return; }
    const topic = deckPrompt.trim() || 'Kara Seek report briefing';
    setDeckThinking(true); setDeckPhase('build');
    const prompt = 'You are Kara Slides Deck Builder. Use ONLY the research report below as your factual source.\n\nRESEARCH REPORT:\n' + report.substring(0, 4000) + '\n\nCreate a presentation about: ' + topic + '\nReturn ONLY lines in this exact format:\nSLIDE: <slide title>\nBODY: <bullet one> | <bullet two> | <bullet three>\nMake exactly 6 slides. No extra text.';
    try {
      const res = await fetch('http://localhost:11434/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'qwen2.5:3b', prompt, stream: false }) });
      const d = await res.json();
      const lines = (d.response || '').split('\n');
      const deck: Slide[] = [];
      let cur: Slide | null = null;
      lines.forEach(ln => {
        const t = ln.trim();
        if (t.toUpperCase().startsWith('SLIDE:')) { cur = { id: Date.now() + deck.length, layout: deck.length === 0 ? 'title' : 'content', title: t.substring(6).trim(), body: '' }; deck.push(cur); }
        else if (t.toUpperCase().startsWith('BODY:') && cur) { cur.body = t.substring(5).split('|').map(b => b.trim()).filter(Boolean).map(b => '- ' + b).join('\n'); }
      });
      if (deck.length) { setSlides(deck); setActiveId(deck[0].id); }
      else { setSlides([{ id: Date.now(), layout: 'content', title: topic, body: report.substring(0, 500) }]); }
    } catch (e) { alert('Kara Local engine offline. Start Ollama.'); }
    setDeckThinking(false); setDeckPhase('');
  };

  const exportHTML = () => {
    const t = theme;
    const slideDivs = slides.map(s => {
      const bullets = s.body.split('\n').filter(Boolean).map(l => '<li>' + esc(l.replace(/^-\s*/, '')) + '</li>').join('');
      if (s.layout === 'title') return '<section class="s c"><h1>' + esc(s.title) + '</h1><p>' + esc(s.body) + '</p></section>';
      if (s.layout === 'big') return '<section class="s c"><h2 class="big">' + esc(s.title) + '</h2></section>';
      if (s.layout === 'blank') return '<section class="s"><p>' + esc(s.body) + '</p></section>';
      return '<section class="s"><h2>' + esc(s.title) + '</h2><ul>' + bullets + '</ul></section>';
    }).join('');
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>Kara Slides Export</title><style>body{margin:0;font-family:Calibri,Segoe UI,sans-serif;background:' + t.bg + ';color:' + t.fg + ';}section.s{display:none;min-height:100vh;padding:8vh 10vw;box-sizing:border-box;}section.s.on{display:block;}section.c{align-items:center;justify-content:center;text-align:center;flex-direction:column;}section.c.on{display:flex;}h1{font-size:56px;color:' + t.accent + ';}h2{font-size:40px;color:' + t.accent + ';}.big{font-size:64px;}li{font-size:26px;margin:14px 0;}p{font-size:24px;}nav{position:fixed;bottom:12px;right:16px;opacity:.6;font-size:14px;}</style></head><body>' + slideDivs + '<nav id="n"></nav><script>var i=0,S=document.querySelectorAll("section");function go(){for(var k=0;k<S.length;k++)S[k].classList.toggle("on",k===i);document.getElementById("n").textContent=(i+1)+" / "+S.length;}document.addEventListener("keydown",function(e){if(e.key==="ArrowRight"||e.key===" ")i=Math.min(S.length-1,i+1);if(e.key==="ArrowLeft")i=Math.max(0,i-1);go();});go();</script></body></html>';
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'KaraSlides.html'; a.click();
  };

  return (
    <div className="flex h-full bg-slate-100">
      <div className="w-44 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
        <div className="p-2 flex flex-wrap gap-1 border-b border-slate-200">
          <button onClick={addSlide} title="Add slide" className="p-1.5 bg-blue-600 text-white rounded"><Plus size={14}/></button>
          <button onClick={dupSlide} title="Duplicate" className="p-1.5 bg-slate-100 rounded hover:bg-slate-200"><Copy size={14}/></button>
          <button onClick={delSlide} title="Delete" className="p-1.5 bg-slate-100 rounded hover:bg-slate-200"><Trash2 size={14}/></button>
          <button onClick={() => move(-1)} title="Move up" className="p-1.5 bg-slate-100 rounded hover:bg-slate-200"><ArrowUp size={14}/></button>
          <button onClick={() => move(1)} title="Move down" className="p-1.5 bg-slate-100 rounded hover:bg-slate-200"><ArrowDown size={14}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => setActiveId(s.id)} className={`w-full text-left rounded border p-2 text-[10px] ${s.id === activeId ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
              <span className="text-slate-400">{i + 1}.</span> <b className="text-slate-700">{s.title || '(untitled)'}</b>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-slate-200 p-2 flex items-center gap-2 flex-wrap flex-shrink-0">
          <input value={deckPrompt} onChange={(e) => setDeckPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') buildDeck(); }} className="border border-slate-200 rounded text-xs py-1.5 px-2 w-80" placeholder="Deck topic... e.g. Dangote Refinery productivity and plan for 2027" />
          <button onClick={buildDeck} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">{deckThinking ? (deckPhase === 'research' ? 'Seek researching...' : 'Building slides...') : 'AI Deck Builder'}</button>
          <button onClick={buildFromReport} className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs rounded hover:bg-teal-700">From Seek Report</button>
          <select value={active?.layout || 'content'} onChange={(e) => update({ layout: e.target.value })} className="border border-slate-200 rounded text-xs py-1 px-2">
            {LAYOUTS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select value={themeIdx} onChange={(e) => setThemeIdx(+e.target.value)} className="border border-slate-200 rounded text-xs py-1 px-2">
            {THEMES.map((t, i) => <option key={t.name} value={i}>{t.name}</option>)}
          </select>
          <button onClick={() => { setPresentIdx(activeIdx >= 0 ? activeIdx : 0); setPresenting(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"><Play size={12}/> Present</button>
          <button onClick={exportHTML} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"><Download size={12}/> Export HTML</button>
          <div className="flex gap-1 flex-wrap w-full">
            {DECK_CHIPS.map((ch, i) => (
              <button key={i} onClick={() => setDeckPrompt(ch)} className="px-2 py-1 bg-white border border-indigo-200 text-indigo-600 text-[10px] rounded hover:bg-indigo-50">{ch.split(':')[0]}...</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
          <div className="w-full max-w-3xl aspect-video shadow-xl rounded-sm flex flex-col" style={{ background: theme.bg, color: theme.fg, padding: '48px' }}>
            {active?.layout !== 'blank' && (
              <input value={active?.title || ''} onChange={(e) => update({ title: e.target.value })}
                className="bg-transparent outline-none border-none w-full font-bold mb-4"
                style={{ color: theme.accent, fontSize: active?.layout === 'title' ? 40 : 30 }} placeholder="Slide title" />
            )}
            <textarea value={active?.body || ''} onChange={(e) => update({ body: e.target.value })}
              className="bg-transparent outline-none border-none w-full flex-1 resize-none leading-relaxed"
              style={{ color: theme.fg, fontSize: active?.layout === 'title' ? 20 : 17, textAlign: active?.layout === 'title' || active?.layout === 'big' ? 'center' : 'left' }}
              placeholder="Body / bullet points (one per line)" />
          </div>
        </div>
      </div>

      {presenting && (() => {
        const s = slides[presentIdx];
        if (!s) return null;
        const bullets = (s.body || '').split('\n').filter(Boolean);
        return (
          <div className="fixed inset-0 z-50 flex flex-col" style={{ background: theme.bg, color: theme.fg }} onClick={() => setPresentIdx(i => Math.min(slides.length - 1, i + 1))}>
            <div className="flex-1 flex flex-col items-center justify-center px-24 text-center">
              {s.layout !== 'blank' && <h1 className="font-bold mb-6" style={{ color: theme.accent, fontSize: s.layout === 'title' ? 64 : 44 }}>{s.title}</h1>}
              {s.layout === 'big' ? <p style={{ fontSize: 30 }}>{s.title}</p> : (
                <ul className="space-y-3 text-left" style={{ fontSize: 26 }}>{bullets.map((b, i) => <li key={i}>• {b.replace(/^-\s*/, '')}</li>)}</ul>
              )}
            </div>
            <div className="pb-4 text-center text-xs opacity-60">{presentIdx + 1} / {slides.length} - arrows navigate, Esc exits</div>
          </div>
        );
      })()}
    </div>
  );
}

