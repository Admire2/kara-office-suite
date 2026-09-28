import Link from "next/link";

export default function ToolComingSoon({ params }: { params: Promise<{ tool: string }> }) {
  const resolvedParams = typeof params === 'object' && 'tool' in params ? params : { tool: 'tool' };
  const toolName = 'tool' in (params as any) ? (params as any).tool : 'this feature';
  
  const formattedName = toolName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-3xl font-bold text-white">Kara {formattedName}</h1>
        <p className="text-lg text-slate-400">
          This agent is currently in active development and will be rolling out to KAWS Pro members soon.
        </p>
        
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-left space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">What to expect:</h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> AI-powered automation</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Seamless CRM integration</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Real-time data syncing</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link 
            href="/kaws/real-estate" 
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition"
          >
            ← Back to Real Estate Suite
          </Link>
          <Link 
            href="/onboard" 
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition"
          >
            Launch Available Agents 🚀
          </Link>
        </div>
      </div>
    </main>
  );
}