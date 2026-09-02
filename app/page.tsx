import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-40 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

      <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-16 text-center">
        <div className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-300 mb-6">
          THE AI CO-FOUNDER FOR EVERY FOUNDER - SOLO OR TEAM
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
          Stop Guessing.<br />Start Building.
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
          FounderPilot AI gives you the clarity of a $500/hour startup consultant in seconds. Validate ideas, map business models, and write copy - without the fluff.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/validator"
            className="rounded-xl bg-cyan-500 px-8 py-4 text-lg font-semibold text-slate-950 transition hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
          >
            Launch the AI Suite
          </Link>
          <a
            href="#features"
            className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
          >
            See Features
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Stat value="4" label="AI tools included" />
          <Stat value="60s" label="Average report time" />
          <Stat value="$0" label="To get started" />
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Everything you need to launch</h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Four connected AI tools that take you from raw idea to ready-to-launch business.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <FeatureCard
            icon="bulb"
            title="Idea Validator"
            desc="Get a brutal, honest SWOT analysis, market demand score, and MVP roadmap for any startup idea."
            href="/validator"
          />
          <FeatureCard
            icon="chart"
            title="Business Model Generator"
            desc="Turn a raw concept into a complete Business Model Canvas with pricing and distribution strategies."
            href="/business-model"
          />
          <FeatureCard
            icon="user"
            title="Customer Persona"
            desc="Discover exactly who will buy your product, what frustrates them, and how to reach them."
            href="/persona"
          />
          <FeatureCard
            icon="pen"
            title="Landing Page Copy"
            desc="Generate high-converting headlines, benefits, FAQs, and SEO metadata in your brand's tone."
            href="/landing-page"
          />
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>

        <div className="grid gap-6 md:grid-cols-3">
          <StepCard number="1" title="Describe your idea" desc="Tell the AI what you want to build, who it is for, and your budget." />
          <StepCard number="2" title="AI analyzes everything" desc="Market demand, competition, risks, pricing, and customer psychology." />
          <StepCard number="3" title="Get your action plan" desc="Receive a structured report with concrete next steps you can execute today." />
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-10 text-center">
          <p className="text-xl md:text-2xl font-medium text-slate-100">
            "Most founders waste 6 months building the wrong thing. FounderPilot tells you the truth in 60 seconds."
          </p>
          <p className="mt-4 text-sm text-slate-400">- The FounderPilot Team</p>
          <Link
            href="/validator"
            className="mt-8 inline-block rounded-xl bg-cyan-500 px-8 py-4 text-lg font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Validate My Idea Now
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12 text-center text-sm text-slate-500">
        <p>(c) 2026 FounderPilot AI. Built for solo founders, co-founders, and teams - by AI.</p>
      </footer>
          <a href="/suite" id="floating-suite-btn" className="fixed bottom-5 right-5 z-50 rounded-full bg-cyan-500 px-5 py-3 font-bold text-slate-950 shadow-2xl hover:bg-cyan-400 transition">⭐ Business Suite</a>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="text-3xl font-bold text-cyan-400">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </div>
  );
}

function StepCard({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-lg font-bold text-slate-950">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc, href }: { icon: string; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:border-cyan-500/50 hover:bg-white/10">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        <Icon name={icon} />
      </div>
      <h3 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition">{title}</h3>
      <p className="text-slate-400">{desc}</p>
    </Link>
  );
}

function Icon({ name }: { name: string }) {
  const common = {
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

  if (name === "bulb") {
    return (
      <svg {...common}>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg {...common}>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg {...common}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}