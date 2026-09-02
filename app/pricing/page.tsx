"use client";
import Link from "next/link";

const LINKS = {
  proMonthly: "https://buy.stripe.com/bJe9AS41yeKP7SkeIUdEs00",
  teamMonthly: "https://buy.stripe.com/4gMbJ069G7in1tW8kwdEs01",
  proAnnual: "https://buy.stripe.com/8x228q41yfOT0pS7gsdEs05",
  teamAnnual: "https://buy.stripe.com/bJebJ069G1Y31tWcAMdEs04",
};

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      tagline: "Test the waters",
      price: "$0",
      period: "forever",
      note: "",
      features: [
        "3 reports per tool",
        "All 4 AI tools included",
        "Saved report history on your device",
        "No credit card required",
      ],
      buttons: [{ label: "Start Free", href: "/validator", primary: false }],
      featured: false,
    },
    {
      name: "Pro",
      tagline: "For serious founders",
      price: "$9",
      period: "per month",
      note: "or $99/year - save 15%",
      features: [
        "1 founder seat",
        "Unlimited AI reports",
        "Priority AI speed",
        "Cloud history (with accounts)",
        "Email support",
      ],
      buttons: [
        { label: "Go Pro Annual\n(Best Value)", href: LINKS.proAnnual, primary: true },
        { label: "Go Pro Monthly", href: LINKS.proMonthly, primary: false },
      ],
      featured: true,
    },
    {
      name: "Team",
      tagline: "For founding teams",
      price: "$29",
      period: "per month",
      note: "or $299/year - save 28%",
      features: [
        "Everything in Pro",
        "Maximum of 5 team seats",
        "Shared project workspace",
        "Team report history",
        "Email support",
      ],
      buttons: [
        { label: "Start Team Annual\n(Best Value)", href: LINKS.teamAnnual, primary: true },
        { label: "Start Team Monthly", href: LINKS.teamMonthly, primary: false },
      ],
      featured: false,
    },
    {
      name: "Enterprise",
      tagline: "For organizations and large teams",
      price: "Custom",
      period: "pricing",
      note: "",
      features: [
        "More than 5 team seats",
        "Dedicated account manager",
        "Priority support with SLA",
        "Custom AI tuning for your industry",
        "Invoice-based billing",
      ],
      buttons: [{ label: "Contact Management", href: "/contact", primary: false }],
      featured: false,
    },
  ];

  return (
    <main className="w-full min-w-0 p-6 md:p-10">
      <div className="mx-auto max-w-6xl min-w-0">
        <header className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Pricing</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Simple pricing that pays for itself</h1>
          <p className="mt-3 text-slate-400">
            One validated idea saves you months of wasted work. Start free, upgrade when you are serious.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                plan.featured
                  ? "border-cyan-500/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 scale-[1.02]"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-xs font-bold text-slate-950">
                  MOST POPULAR
                </div>
              )}

              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="text-sm text-slate-400">{plan.tagline}</p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-slate-400">{plan.period}</span>
              </div>
              {plan.note && <p className="mt-1 text-sm font-medium text-emerald-300">{plan.note}</p>}

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3">
                {plan.buttons.map((btn) => (
                  <Link
                    key={btn.label}
                    href={btn.href}
                    target={btn.href.startsWith("http") ? "_blank" : "_self"}
                    className={`whitespace-pre-line rounded-xl px-6 py-3 text-center font-semibold transition ${
                      btn.primary
                        ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {btn.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-sm text-slate-400">
            Payments are processed securely by Stripe. Annual plans are billed once per year. Teams larger than 5 members should contact management for Enterprise pricing.
          </p>
        </div>
      </div>
    </main>
  );
}