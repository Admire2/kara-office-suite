import Link from "next/link";

const tools = [
  { name: "Kara Scout", href: "/kaws/scout", icon: "🕵️", status: "IN BUILD", desc: "Say your buy-box in plain language - or paste any listing link. Kara pulls county records and deed data, filters absentee owners, high-equity and pre-foreclosure properties, scores likely-to-sell propensity, skip-traces at $0.09/lead and offers to call the owner.", beats: "Replaces PropStream + DealMachine + manual lists" },
  { name: "Kara Leaderboard", href: "/kaws/leaderboard", icon: "📈", status: "IN BUILD", desc: "Live leaderboard of the most underpriced and overpriced properties in any neighborhood, ranked by a pricing algorithm you can interrogate by voice.", beats: "The viral NYC leaderboard tool - as a KAWS member" },
  { name: "Kara Map", href: "/kaws/map", icon: "🗺️", status: "IN BUILD", desc: "Interactive deal map scored by transit, schools, coffee shops and amenities, with price-per-sqft heat layers, parcel boundaries and zoning overlays.", beats: "Replaces spreadsheet comps + drive-arounds" },
  { name: "Kara Investor", href: "/kaws/investor", icon: "📊", status: "IN BUILD", desc: "Voice-enabled deal analyzer: ARV, rehab budget, rental yield and cash-on-cash - plus instant screening with the 70% MAO rule, 1% rule, 7% gross-yield rule and 50% opex rule.", beats: "Replaces spreadsheets + HouseCanary" },
  { name: "Kara Caller", href: "/kaws/caller", icon: "📲", status: "LIVE ENGINE", desc: "Upload 100 absentee owners. Kara calls every one while you sleep, qualifies interest and books hot leads straight onto your calendar.", beats: "Replaces Retell AI + Calendly glue + cold-call VAs" },
  { name: "Kara Negotiator", href: "/kaws/negotiator", icon: "🤝", status: "IN BUILD", desc: "Drafts offers and counter-offers, then negotiates terms by voice and email - strictly inside the limits you set.", beats: "The AI COO negotiator everyone is copying" },
  { name: "Kara Scriptwriter", href: "/kaws/scriptwriter", icon: "✍️", status: "IN BUILD", desc: "Writes per-lead call scripts, SMS sequences and email outreach from the intake form - no more blank-page mornings.", beats: "Replaces the Claude-prompting layer of rival stacks" },
  { name: "Kara Auction", href: "/kaws/auction", icon: "🔨", status: "IN BUILD", desc: "Watches sheriff sales, HUD and Auction.com daily; alerts you the moment a deal matches your buy-box.", beats: "Replaces manual auction monitoring" },
  { name: "Kara CRM", href: "/kaws/crm", icon: "🗄️", status: "LIVE", desc: "Every call becomes a structured intake form with a completeness score - and Kara nudges you until you follow up.", beats: "Replaces Follow Up Boss + sticky notes" },
  { name: "Kara Vision", href: "/kaws/vision", icon: "👁️", status: "IN BUILD", desc: "Send a photo or a Street View snapshot: Kara grades condition, counts rooms, estimates the rehab budget and adjusts ARV - then stages the listing virtually.", beats: "Replaces Restb.ai + HouseCanary photo AI + REimagineHome staging" },
  { name: "Kara Reader", href: "/kaws/reader", icon: "📄", status: "IN BUILD", desc: "Drop an Offering Memorandum, rent roll, lease or settlement statement: Kara extracts every financial line and flags hidden risks in seconds.", beats: "Replaces V7 Labs + Relm CRE risk scans" },
  { name: "Kara Nurture", href: "/kaws/nurture", icon: "💬", status: "IN BUILD", desc: "Automated SMS and email drip that keeps every lead warm until an appointment is booked - in the lead's own language.", beats: "Replaces Structurely + Ylopo rAIya" },
  { name: "Kara Valuate", href: "/kaws/valuate", icon: "🎁", status: "LIVE SOON", desc: "Free public tool: any homeowner types an address, gets an instant AI estimate - and becomes a qualified seller lead in your CRM.", beats: "The free-valuation lead magnet Zillow guards jealously" },
  { name: "Kara Autopilot", href: "/kaws/autopilot", icon: "🛰️", status: "LIVE", desc: "Your AI COO: nightly autonomous workflows - pull lists, skip-trace, launch call campaigns, compile briefings, nudge humans.", beats: "The autonomous-workflow layer rivals charge extra for" },
  { name: "Kara Coordinator", href: "/kaws/coordinator", icon: "📋", status: "LIVE", desc: "Generate professional closing timelines and task lists instantly. Never miss a deadline.", beats: "Replaces ListedKit ($49/transaction)" },
  { name: "Kara Contract Review", href: "/kaws/contract", icon: "⚖️", status: "LIVE", desc: "Paste contract text to instantly flag missing clauses and risky terms.", beats: "Replaces Spellbook (Enterprise)" },
  { name: "Kara MCP Server", href: "/api/karakata/kaws/mcp", icon: "🔌", status: "LIVE", desc: "Model Context Protocol: Exposes Kara tools to Claude Desktop, Cursor, and custom AI agents.", beats: "The open-standard AI connector" },
  { name: "Kara Mobile DFD", href: "/kaws/mobile-dfd", icon: "📱", status: "LIVE", desc: "Driving for Dollars: Snap photos of distressed properties, auto-add to Scout, and skip-trace owners instantly.", beats: "Replaces DealMachine app" }
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
          <p className="text-sm text-slate-300 mb-4">You hold a state license. Unlock MLS live data, full CMA reports, IDX website search, listing marketing, and transaction coordination. Earn commissions legally.</p>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>✅ 600+ MLSs live across US & Canada</li>
            <li>✅ Full CMA with MLS comps</li>
            <li>✅ IDX search on your website</li>
            <li>✅ Represent buyers & sellers</li>
            <li>✅ Transaction coordination (ListedKit-level)</li>
            <li>✅ Contract review (Spellbook-level)</li>
          </ul>
        </div>
        <div className="rounded-xl border border-amber-700 bg-amber-900/20 p-6">
          <div className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-2">Track 2</div>
          <h3 className="text-xl font-bold mb-2">💼 Unlicensed Real Estate Investor</h3>
          <p className="text-sm text-slate-300 mb-4">No license needed. Use public records, skip tracing, driving for dollars, auction monitoring, and wholesale deal analysis. Assign contracts, don't represent clients.</p>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>✅ County records + skip tracing</li>
            <li>✅ Wholesale / fix-and-flip analysis</li>
            <li>✅ Auction + pre-foreclosure alerts</li>
            <li>✅ Driving for Dollars mobile app</li>
            <li>✅ Cinematic listing video from photos</li>
            <li>❌ No MLS (public data only)</li>
          </ul>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 text-sm text-slate-300">
          <span className="font-bold text-white">The viral stack vs KAWS:</span> competitors glue together Claude + PropStream + Retell + skip-tracing for ~$300/mo - five tools, one language, zero accountability. KAWS Pro ($399) ships eighteen agents that share one brain, one CRM and one phone pool, in five languages, with an AI COO that nags you until leads are contacted. Starter ($149) already out-calls their entire stack.
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
              <span className={"text-xs px-2 py-1 rounded " + (t.status === "LIVE" || t.status === "LIVE ENGINE" ? "bg-emerald-900 text-emerald-300" : "bg-amber-900 text-amber-300")}>{t.status}</span>
            </div>
            <p className="text-sm text-slate-300 mb-3">{t.desc}</p>
            <p className="text-xs text-slate-500 italic">{t.beats}</p>
          </Link>
        ))}
        
        <Link href="/onboard" className="block bg-indigo-900/20 border border-indigo-700 rounded-xl p-6 flex flex-col justify-center hover:bg-indigo-900/30 transition cursor-pointer">
          <h3 className="text-lg font-bold mb-2 text-indigo-300">Want Kara on your phones today?</h3>
          <p className="text-sm text-slate-300 mb-4">The AI Sales Rep is live now for all 12 industries - including brokerages, wholesalers and property managers.</p>
          <span className="text-center py-3 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white">Launch My AI Sales Rep →</span>
        </Link>
      </section>
    </main>
  );
}