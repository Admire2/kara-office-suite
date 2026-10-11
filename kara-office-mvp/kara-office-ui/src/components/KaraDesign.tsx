import { useState, useRef, useEffect } from 'react';
import { Square, Circle, Type, Download, Trash2, ArrowUp, ArrowDown, Sparkles, Loader2 } from 'lucide-react';

type Shape = { id: string; type: 'rect' | 'circle' | 'text'; x: number; y: number; w: number; h: number; text?: string; color: string };

export default function KaraDesign() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'rect' | 'circle' | 'text'>('rect');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [initialShape, setInitialShape] = useState<Shape | null>(null);

  const selectedShape = shapes.find(s => s.id === selectedId);

  const addShape = () => {
    if (!canvasRef.current) return;
    const newShape: Shape = {
      id: Date.now().toString(36), type: tool, x: 50, y: 50, w: 120, h: tool === 'text' ? 40 : 120,
      text: tool === 'text' ? 'Double click to edit' : undefined, color: tool === 'text' ? '#0f172a' : '#6366f1'
    };
    setShapes([...shapes, newShape]);
    setSelectedId(newShape.id);
  };

  const updateShape = (id: string, patch: Partial<Shape>) => setShapes(shapes.map(s => s.id === id ? { ...s, ...patch } : s));
  const delShape = (id: string) => { setShapes(shapes.filter(s => s.id !== id)); setSelectedId(null); };

  const bringToFront = () => {
    if (!selectedId) return;
    const idx = shapes.findIndex(s => s.id === selectedId);
    if (idx < shapes.length - 1) {
      const newShapes = [...shapes];
      [newShapes[idx], newShapes[idx + 1]] = [newShapes[idx + 1], newShapes[idx]];
      setShapes(newShapes);
    }
  };

  const sendToBack = () => {
    if (!selectedId) return;
    const idx = shapes.findIndex(s => s.id === selectedId);
    if (idx > 0) {
      const newShapes = [...shapes];
      [newShapes[idx], newShapes[idx - 1]] = [newShapes[idx - 1], newShapes[idx]];
      setShapes(newShapes);
    }
  };

  // AI Design Assistant
  const generateDesign = async () => {
    if (!aiPrompt.trim()) return;
    setAiThinking(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5:3b',
          prompt: `You are a graphic design AI. Generate a JSON array of shapes based on this request: "${aiPrompt}". 
Rules: 
1. Each object must have: id (string), type ('rect', 'circle', or 'text'), x (number 50-700), y (number 50-500), w (number 100-300), h (number 100-300), color (hex string like '#ff0000'), and text (string, only for type 'text'). 
2. Create 3-5 shapes to make a complete composition. 
3. Output ONLY the raw JSON array, no markdown formatting, no explanation.`,
          stream: false
        })
      });
      const d = await res.json();
      let clean = (d.response || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const start = clean.indexOf('[');
      const end = clean.lastIndexOf(']');
      if (start !== -1 && end !== -1) {
        const jsonStr = clean.substring(start, end + 1);
        const parsed = JSON.parse(jsonStr);
        const newShapes: Shape[] = parsed.map((s: any, i: number) => ({
          id: Date.now().toString(36) + i,
          type: ['rect', 'circle', 'text'].includes(s.type) ? s.type : 'rect',
          x: Math.max(0, Math.min(800, Number(s.x) || 50)),
          y: Math.max(0, Math.min(600, Number(s.y) || 50)),
          w: Math.max(20, Number(s.w) || 100),
          h: Math.max(20, Number(s.h) || 100),
          color: s.color || '#6366f1',
          text: s.type === 'text' ? (s.text || 'AI Text') : undefined
        }));
        setShapes(prev => [...prev, ...newShapes]);
      }
    } catch (e) {
      alert('AI offline. Ensure Ollama is running.');
    }
    setAiThinking(false);
    setAiPrompt('');
  };

  // Native Canvas Export
  const exportPNG = () => {
    if (!canvasRef.current || shapes.length === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = canvasRef.current.clientWidth;
    canvas.height = canvasRef.current.clientHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach(s => {
      ctx.fillStyle = s.color;
      if (s.type === 'rect') {
        ctx.fillRect(s.x, s.y, s.w, s.h);
      } else if (s.type === 'circle') {
        ctx.beginPath();
        ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2, s.w / 2, s.h / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
      } else if (s.type === 'text') {
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = s.color;
        ctx.fillText(s.text || '', s.x, s.y + 20);
      }
    });

    const link = document.createElement('a');
    link.download = 'kara-design-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent, id: string, isResizeHandle = false) => {
    e.stopPropagation();
    setSelectedId(id);
    const shape = shapes.find(s => s.id === id);
    if (!shape) return;
    setInitialShape(shape);
    setStartPos({ x: e.clientX, y: e.clientY });
    if (isResizeHandle) setIsResizing(true);
    else setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!initialShape || !selectedId) return;
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;

      if (isDragging) {
        updateShape(selectedId, { x: initialShape.x + dx, y: initialShape.y + dy });
      } else if (isResizing) {
        updateShape(selectedId, { 
          w: Math.max(20, initialShape.w + dx), 
          h: Math.max(20, initialShape.h + dy) 
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setInitialShape(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, initialShape, selectedId, startPos]);

  return (
    <div className="h-full flex bg-slate-50">
      {/* Toolbar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-10">
        {/* AI Section */}
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
            <Sparkles size={14} className="text-purple-600"/> AI Design Assistant
          </div>
          <textarea 
            value={aiPrompt} 
            onChange={e => setAiPrompt(e.target.value)} 
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateDesign(); } }}
            placeholder="e.g., 'A red circle with a blue square next to it and text saying Hello'"
            className="w-full border border-slate-200 rounded p-2 text-xs resize-none h-20 focus:ring-1 focus:ring-purple-500 outline-none"
          />
          <button 
            onClick={generateDesign} 
            disabled={aiThinking}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {aiThinking ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>} 
            {aiThinking ? 'Designing...' : 'Generate'}
          </button>
        </div>

        {/* Tools Section */}
        <div className="p-3 border-b border-slate-200 flex flex-col gap-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Tools</div>
          <div className="flex gap-2">
            <button onClick={() => setTool('rect')} className={`flex-1 p-2 rounded flex justify-center ${tool === 'rect' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}><Square size={18}/></button>
            <button onClick={() => setTool('circle')} className={`flex-1 p-2 rounded flex justify-center ${tool === 'circle' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}><Circle size={18}/></button>
            <button onClick={() => setTool('text')} className={`flex-1 p-2 rounded flex justify-center ${tool === 'text' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}><Type size={18}/></button>
          </div>
          <button onClick={addShape} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
            <Square size={14}/> Add {tool === 'rect' ? 'Rectangle' : tool === 'circle' ? 'Circle' : 'Text'}
          </button>
        </div>

        {/* Actions Section */}
        {selectedShape && (
          <div className="p-3 border-b border-slate-200 flex flex-col gap-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Selected Shape</div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600">Color:</label>
              <input type="color" value={selectedShape.color} onChange={e => updateShape(selectedShape.id, { color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
            </div>
            <div className="flex gap-1">
              <button onClick={bringToFront} className="flex-1 p-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 flex justify-center" title="Bring to Front"><ArrowUp size={14}/></button>
              <button onClick={sendToBack} className="flex-1 p-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 flex justify-center" title="Send to Back"><ArrowDown size={14}/></button>
              <button onClick={delShape} className="flex-1 p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 flex justify-center" title="Delete"><Trash2 size={14}/></button>
            </div>
          </div>
        )}

        <div className="flex-1"></div>
        
        {/* Export */}
        <div className="p-3 border-t border-slate-200">
          <button onClick={exportPNG} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700">
            <Download size={14}/> Export as PNG
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={canvasRef} className="flex-1 relative bg-white m-4 rounded shadow-sm border border-slate-200 overflow-hidden" onClick={() => setSelectedId(null)}>
        {shapes.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm pointer-events-none">Use the AI Assistant or add shapes manually</div>}
        
        {shapes.map(s => (
          <div 
            key={s.id} 
            className={`absolute group ${selectedId === s.id ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:ring-1 hover:ring-slate-300'}`}
            style={{ left: s.x, top: s.y, width: s.w, height: s.h, cursor: isDragging && selectedId === s.id ? 'grabbing' : 'grab' }}
            onMouseDown={(e) => handleMouseDown(e, s.id)}
          >
            {s.type === 'rect' && <div className="w-full h-full rounded opacity-90" style={{ backgroundColor: s.color }}></div>}
            {s.type === 'circle' && <div className="w-full h-full rounded-full opacity-90" style={{ backgroundColor: s.color }}></div>}
            {s.type === 'text' && (
              <input 
                value={s.text} 
                onChange={e => updateShape(s.id, { text: e.target.value })} 
                className="w-full h-full bg-transparent border-none outline-none font-semibold pointer-events-auto"
                style={{ color: s.color }}
                onMouseDown={(e) => e.stopPropagation()}
              />
            )}
            
            {selectedId === s.id && (
              <div 
                className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full cursor-nwse-resize z-20"
                onMouseDown={(e) => handleMouseDown(e, s.id, true)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
