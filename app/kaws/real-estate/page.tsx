import Link from "next/link";

const tools = [
  { name: "Kara Scout", href: "/kaws/scout", icon: "🕵️", status: "IN BUILD", desc: "Say your buy-box in plain language. Kara pulls county records, filters absentee owners, skip-traces at $0.09/lead and offers to call the owner.", beats: "Replaces PropStream + DealMachine" },
  { name: "Kara Leaderboard", href: "/kaws/leaderboard", icon: "📈", status: "IN BUILD", desc: "Live leaderboard of underpriced and overpriced properties, ranked by a pricing algorithm you can interrogate by voice.", beats: "The viral NYC leaderboard tool" },
  { name: "Kara Map", href: "/kaws/map", icon: "🗺️", status: "IN BUILD", desc: "Interactive deal map scored by transit, schools, amenities, with price-per-sqft heat layers and zoning overlays.", beats: "Replaces spreadsheet comps + drive-arounds" },
  { name: "Kara Investor", href: "/kaws/investor", icon: "📊", status: "IN BUILD", desc: "Voice-enabled deal analyzer: ARV, rehab budget, rental yield, cash-on-cash, plus 70% MAO and 1% rule screening.", beats: "Replaces spreadsheets + HouseCanary" },
  { name: "Kara Caller", href: "/kaws/caller", icon: "📲", status: "LIVE ENGINE", desc: "Upload 100 absentee owners. Kara calls every one while you sleep, qualifies interest and books hot leads.", beats: "Replaces Retell AI + cold-call VAs" },
  { name: "Kara Negotiator", href: "/kaws/negotiator", icon: "🤝", status: "IN BUILD", desc: "Drafts offers and counter-offers, then negotiates terms by voice and email inside your set limits.", beats: "The AI COO negotiator" },
  { name: "Kara Scriptwriter", href: "/kaws/scriptwriter", icon: "✍️", status: "IN BUILD", desc: "Writes per-lead call scripts, SMS sequences and email outreach from the intake form instantly.", beats: "Replaces manual copywriting" },
  { name: "Kara Auction", href: "/kaws/auction", icon: "🔨", status: "IN BUILD", desc: "Watches sheriff sales, HUD and Auction.com daily; alerts you the moment a deal matches your buy-box.", beats: "Replaces manual auction monitoring" },
  { name: "Kara CRM", href: "/kaws/crm", icon: "🗄️", status: "LIVE", desc: "Every call becomes a structured intake form with a completeness score - and Kara nudges you to follow up.", beats: "Replaces Follow Up Boss" },
  { name: "Kara Vision", href: "/kaws/vision", icon: "👁️", status: "IN BUILD", desc: "Send a photo or Street View snapshot: Kara grades condition, estimates rehab budget and stages virtually.", beats: "Replaces Restb.ai + REimagineHome" },
  { name: "Kara Reader", href: "/kaws/reader", icon: "📄", status: "IN BUILD", desc: "Drop an Offering Memorandum, rent roll, or lease: Kara extracts every financial line and flags risks.", beats: "Replaces V7 Labs + Relm" },
  { name: "Kara Nurture", href: "/kaws/nurture", icon: "💬", status: "IN BUILD", desc: "Automated SMS and email drip that keeps every lead warm until an appointment is booked.", beats: "Replaces Structurely + Ylopo" },
  { name: "Kara Valuate", href: "/kaws/valuate", icon: "🎁", status: "LIVE SOON", desc: "Free public tool: homeowner types an address, gets an instant AI estimate, and becomes a qualified lead.", beats: "The Zillow lead magnet" },
  { name: "Kara Autopilot", href: "/kaws/autopilot", icon: "🛰️", status: "LIVE", desc: "Your AI COO: nightly autonomous workflows - pull lists, skip-trace, launch campaigns, nudge humans.", beats: "The autonomous-workflow layer" },
  { name: "Kara Coordinator", href: "/kaws/coordinator", icon: "📋", status: "LIVE", desc: "Generate professional closing timelines and task lists instantly. Never miss a deadline.", beats: "Replaces ListedKit ($49/tx)" },
  { name: "Kara Contract Review", href: "/kaws/contract", icon: "⚖️", status: "LIVE", desc: "Paste contract text to instantly flag missing clauses and risky terms.", beats: "Replaces Spellbook" },
  { name: "Kara MCP Server", href: "/kaws/mcp", icon: "🔌", status: "LIVE", desc: "Model Context Protocol: Exposes Kara tools to Claude Desktop, Cursor, and custom AI agents.", beats: "The open-standard AI connector" },
  { name: "Kara Mobile DFD", href: "/kaws/mobile-dfd", icon: "📱", status: "LIVE", desc: "Driving for Dollars: Snap photos of distressed properties, auto-add to Scout, skip-trace owners.", beats: "Replaces DealMachine app" },{ name: "Kara Lifeline & Downsize", href: "/kaws/lifeline", icon: "🛡️", status: "LIVE", desc: "Pre-foreclosure rescue, probate, and downsizing intervention. Empathetic AI outreach to save credit and capture exclusive leads.", beats: "Replaces cold-calling vultures" },
];

export default function RealEstateSuitePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-sm font-bold tracking-widest text-indigo-400 uppercase mb-3">KAWS Member 02</div>
        <h1 className="text-4xl font-bold mb-4">KAWS Real Estate Suite</h1>
        <p className="text-lg text-slate-400 max-w-3xl">Eighteen AI agents that cover the whole deal cycle: find it, rank it, map it, analyze it, call the owner, negotiate, watch the auction, and never drop the follow-up.</p>
      </header>

      <section className="max-w-6xl mx-auto px-6 pb-8 grid md:grid-cols-2 gap-5">
        <div className="rounded-xl border border-emerald-700 bg-emerald-900/20 p-6">
          <div className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-2">Track 1</div>
          <h3 className="text-xl font-bold mb-2">Licensed Real Estate Agent</h3>
          <p className="text-sm text-slate-300 mb-4">You hold a state license. Unlock MLS live data, full CMA reports, IDX website search, listing marketing, and transaction coordination.</p>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>✅ 600+ MLSs live across US & Canada</li>
            <li>✅ Full CMA with MLS comps</li>
            <li>✅ IDX search on your website</li>
            <li>✅ Transaction coordination & Contract review</li>
          </ul>
        </div>
        <div className="rounded-xl border border-amber-700 bg-amber-900/20 p-6">
          <div className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-2">Track 2</div>
          <h3 className="text-xl font-bold mb-2">💼 Unlicensed Real Estate Investor</h3>
          <p className="text-sm text-slate-300 mb-4">No license needed. Use public records, skip tracing, driving for dollars, auction monitoring, and wholesale deal analysis.</p>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>✅ County records + skip tracing</li>
            <li>✅ Wholesale / fix-and-flip analysis</li>
            <li>✅ Auction + pre-foreclosure alerts</li>
            <li>✅ Driving for Dollars mobile app</li>
          </ul>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-5">
        {tools.map((t) => (
          <Link 
            key={t.name} 
            href={t.href} 
            className="block bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-500 hover:bg-slate-800/50 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl group-hover:scale-110 transition-transform">{t.icon}</span>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{t.name}</h3>
              </div>
              <span className={"text-xs px-2 py-1 rounded " + (t.status.includes("LIVE") ? "bg-emerald-900 text-emerald-300" : "bg-amber-900 text-amber-300")}>{t.status}</span>
            </div>
            <p className="text-sm text-slate-300 mb-3">{t.desc}</p>
            <p className="text-xs text-slate-500 italic">{t.beats}</p>
          </Link>
        ))}
        
        <Link href="/onboard" className="block bg-indigo-900/20 border border-indigo-700 rounded-xl p-6 flex flex-col justify-center hover:bg-indigo-900/30 transition cursor-pointer md:col-span-2">
          <h3 className="text-lg font-bold mb-2 text-indigo-300 text-center">Want Kara on your phones today?</h3>
          <p className="text-sm text-slate-300 mb-4 text-center">The AI Sales Rep is live now for all 12 industries - including brokerages, wholesalers and property managers.</p>
          <span className="text-center py-3 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white">Launch My AI Sales Rep →</span>
        </Link>
      </section>
    </main>
  );
}