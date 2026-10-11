import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, User } from 'lucide-react';

type Task = { id: string; title: string; assignee: string; status: 'todo' | 'doing' | 'done'; due: string };
const KEY = 'karaFlowTasks';

export default function KaraFlow() {
  const [tasks, setTasks] = useState<Task[]>(() => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } });
  const [newTask, setNewTask] = useState({ title: '', assignee: '', due: '' });
  const [overCol, setOverCol] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(tasks)); }, [tasks]);

  const addTask = () => {
    if (!newTask.title) return;
    setTasks([...tasks, { id: Date.now().toString(36), ...newTask, status: 'todo' }]);
    setNewTask({ title: '', assignee: '', due: '' });
  };
  const move = (id: string, s: Task['status']) => setTasks(tasks.map(t => t.id === id ? { ...t, status: s } : t));
  const del = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const cols: { id: Task['status']; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'bg-slate-100' },
    { id: 'doing', label: 'In Progress', color: 'bg-blue-50' },
    { id: 'done', label: 'Done', color: 'bg-green-50' }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 p-4">
      <div className="flex gap-2 mb-4 bg-white p-3 rounded shadow-sm">
        <input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="Task title" className="flex-1 border border-slate-200 rounded px-2 text-sm" />
        <input value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))} placeholder="Assignee" className="w-32 border border-slate-200 rounded px-2 text-sm" />
        <input type="date" value={newTask.due} onChange={e => setNewTask(p => ({ ...p, due: e.target.value }))} className="border border-slate-200 rounded px-2 text-sm" />
        <button onClick={addTask} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center gap-1"><Plus size={14}/> Add</button>
      </div>
      <div className="flex-1 flex gap-4 overflow-x-auto">
        {cols.map(c => (
          <div key={c.id}
            className={`flex-1 min-w-[280px] ${c.color} rounded p-3 flex flex-col transition ${overCol === c.id ? 'ring-2 ring-indigo-500' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setOverCol(c.id); }}
            onDragLeave={() => setOverCol(null)}
            onDrop={(e) => { e.preventDefault(); if (dragId) move(dragId, c.id); setOverCol(null); setDragId(null); }}>
            <h3 className="font-bold text-slate-700 mb-3 flex items-center justify-between">
              {c.label} <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === c.id).length}</span>
            </h3>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {tasks.filter(t => t.status === c.id).map(t => (
                <div key={t.id} draggable
                  onDragStart={() => setDragId(t.id)}
                  onDragEnd={() => { setDragId(null); setOverCol(null); }}
                  className={`bg-white p-3 rounded shadow-sm border border-slate-200 group cursor-grab active:cursor-grabbing ${dragId === t.id ? 'opacity-40' : ''}`}>
                  <p className="font-semibold text-sm text-slate-800 mb-2">{t.title}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1"><User size={12}/> {t.assignee || 'Unassigned'}</span>
                    <span className="flex items-center gap-1"><Calendar size={12}/> {t.due || 'No date'}</span>
                  </div>
                  <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
                    {c.id !== 'todo' && <button onClick={() => move(t.id, c.id === 'done' ? 'doing' : 'todo')} className="px-2 py-1 bg-slate-100 rounded text-[10px] hover:bg-slate-200">← Back</button>}
                    {c.id !== 'done' && <button onClick={() => move(t.id, c.id === 'todo' ? 'doing' : 'done')} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-[10px] hover:bg-indigo-200">Forward →</button>}
                    <button onClick={() => del(t.id)} className="ml-auto text-slate-300 hover:text-red-500"><Trash2 size={12}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
