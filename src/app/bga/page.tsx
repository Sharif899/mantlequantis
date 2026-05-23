"use client";
import Link from "next/link";
import { STRATEGIES } from "@/lib/strategies";
import { useStore } from "@/lib/store";
import { Card, StatCard, Badge, SectionTitle, Button } from "@/components/ui";

const PROBLEMS = [
  {
    icon: "🏦",
    title: "Institutional Advantage",
    problem:
      "Hedge funds and quant desks spend millions on proprietary algorithms, real-time data feeds, and PhD-level talent. Retail traders have none of this.",
    solution:
      "MantleQuant gives retail users the exact same quant strategies — momentum, mean reversion, smart money tracking — for free.",
  },
  {
    icon: "💸",
    title: "Learning Costs Real Money",
    problem:
      "The only way to learn algorithmic trading is to trade. But every mistake with real funds is a real loss — beginners lose thousands before they find their edge.",
    solution:
      "Paper trading on Mantle Sepolia lets anyone experiment with AI strategies risk-free, building confidence before deploying real capital.",
  },
  {
    icon: "⚫",
    title: "Black Box AI",
    problem:
      "Most AI trading tools are black boxes. Users can't see why the AI made a decision — they're just told to trust it. That's not finance, that's gambling.",
    solution:
      "Every signal MantleQuant generates is explainable: exact indicators, exact thresholds, exact logic — auditable by anyone in the Transparency Center.",
  },
  {
    icon: "🌍",
    title: "Geographic Exclusion",
    problem:
      "Sophisticated financial tools are only available in English, require expensive subscriptions, and assume users have bank accounts in wealthy countries.",
    solution:
      "MantleQuant is open-source, free, runs on-chain with no KYC, and is accessible to anyone with a wallet — from Lagos to Jakarta to Buenos Aires.",
  },
];

const IMPACT_METRICS = [
  { label: "Starting Capital Required", value: "$0", sub: "vs. $25,000+ for US pattern day trading" },
  { label: "Monthly Subscription", value: "Free", sub: "vs. $99–$999 for institutional tools" },
  { label: "KYC / ID Required", value: "None", sub: "Wallet-only access" },
  { label: "Countries Supported", value: "195+", sub: "Anywhere with internet" },
];

const BGA_PRINCIPLES = [
  {
    principle: "Financial Inclusion",
    how: "Paper trading removes the capital barrier to learning quant trading. Anyone with a wallet and a browser can participate.",
    score: "Direct",
  },
  {
    principle: "Reduce Information Asymmetry",
    how: "Smart money tracking and AI signals give retail users the same market intelligence that institutional traders pay millions for.",
    score: "Direct",
  },
  {
    principle: "Market Fairness",
    how: "Cross-pool arbitrage by our agents tightens spreads on Mantle DEXes, improving price efficiency for all traders — not just the arb bot.",
    score: "Systemic",
  },
  {
    principle: "Transparency & Accountability",
    how: "Every trade logged on Mantle Sepolia. Every AI decision explained in plain language. No black box. Fully auditable.",
    score: "Direct",
  },
  {
    principle: "Open Source",
    how: "All strategy logic is open-source and documented. Anyone can fork, verify, or improve the strategies.",
    score: "Direct",
  },
  {
    principle: "Real-world Impact",
    how: "Users in emerging markets can practice and learn institutional-grade strategies before deploying real capital — reducing losses from inexperience.",
    score: "Direct",
  },
];

export default function BGAPage() {
  const { portfolio } = useStore();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Hero */}
      <div className="text-center mb-10 py-8 px-4 rounded-2xl border border-mantle-border bg-gradient-to-b from-[#13131F] to-mantle-bg">
        <div className="text-4xl mb-4">🌍</div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Democratizing Quant Trading
        </h1>
        <p className="text-mantle-muted max-w-xl mx-auto text-sm leading-relaxed mb-4">
          Institutional traders have had unfair advantages for decades — proprietary algorithms,
          real-time whale data, and AI that most people can't access. MantleQuant is built
          specifically to close that gap, on Mantle Network.
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="green">BGA Track Submission</Badge>
          <Badge variant="purple">Blockchain for Good Alliance</Badge>
          <Badge variant="gray">Financial Inclusion</Badge>
        </div>
      </div>

      {/* Impact metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {IMPACT_METRICS.map((m) => (
          <StatCard key={m.label} label={m.label} value={m.value} sub={m.sub} positive />
        ))}
      </div>

      {/* The problem + solution */}
      <div className="mb-8">
        <SectionTitle>The Problems We Solve</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROBLEMS.map((p) => (
            <Card key={p.title}>
              <div className="text-2xl mb-3">{p.icon}</div>
              <h3 className="font-semibold text-white mb-2">{p.title}</h3>
              <div className="mb-3">
                <div className="text-xs text-mantle-coral font-medium uppercase tracking-wide mb-1">
                  The Problem
                </div>
                <p className="text-xs text-mantle-muted leading-relaxed">{p.problem}</p>
              </div>
              <div>
                <div className="text-xs text-mantle-teal font-medium uppercase tracking-wide mb-1">
                  Our Solution
                </div>
                <p className="text-xs text-white/80 leading-relaxed">{p.solution}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* BGA alignment table */}
      <Card className="mb-8">
        <SectionTitle>BGA Criteria Alignment</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mantle-border">
                {["BGA Principle", "How MantleQuant Addresses It", "Type"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-mantle-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BGA_PRINCIPLES.map((row) => (
                <tr key={row.principle} className="border-b border-mantle-border hover:bg-[#0D0D14] transition-colors">
                  <td className="py-3 px-3 font-medium text-white whitespace-nowrap">{row.principle}</td>
                  <td className="py-3 px-3 text-sm text-mantle-muted leading-relaxed">{row.how}</td>
                  <td className="py-3 px-3">
                    <Badge variant={row.score === "Direct" ? "green" : "purple"} className="text-[10px] whitespace-nowrap">
                      {row.score}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* How paper trading achieves this */}
      <Card className="mb-8">
        <SectionTitle>Why Paper Trading on Mantle = Financial Inclusion</SectionTitle>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#2A2858] flex items-center justify-center text-mantle-purple font-bold text-sm shrink-0">1</div>
            <div>
              <div className="font-medium text-white text-sm mb-1">Zero barrier to entry</div>
              <p className="text-xs text-mantle-muted leading-relaxed">
                Traditional algorithmic trading requires capital (pattern day trading rules mandate $25,000 minimum in the US),
                expensive subscriptions, and technical expertise. MantleQuant requires only a Web3 wallet — accessible globally with no ID, no minimum balance.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#2A2858] flex items-center justify-center text-mantle-purple font-bold text-sm shrink-0">2</div>
            <div>
              <div className="font-medium text-white text-sm mb-1">Learn without losing real money</div>
              <p className="text-xs text-mantle-muted leading-relaxed">
                The biggest reason retail traders fail is learning with real capital. Paper trading gives users a $10,000 virtual portfolio
                to practice AI strategies, understand risk, and build conviction — before a single real dollar is at risk.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#2A2858] flex items-center justify-center text-mantle-purple font-bold text-sm shrink-0">3</div>
            <div>
              <div className="font-medium text-white text-sm mb-1">On-chain performance record = financial credibility</div>
              <p className="text-xs text-mantle-muted leading-relaxed">
                Every paper trade is logged on Mantle Sepolia. A user who runs a profitable AI strategy for 3 months has an immutable,
                verifiable performance record — a form of on-chain financial credibility that doesn't require a bank statement or credit score.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#2A2858] flex items-center justify-center text-mantle-purple font-bold text-sm shrink-0">4</div>
            <div>
              <div className="font-medium text-white text-sm mb-1">Transparent AI = trustworthy AI</div>
              <p className="text-xs text-mantle-muted leading-relaxed">
                Retail users are often burned by AI products they can't understand or audit. MantleQuant's Transparency Center shows
                every strategy's exact logic, every signal's exact reason, and every trade's on-chain record. Users can trust the AI
                because they can verify it.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Strategy BGA breakdown */}
      <Card className="mb-8">
        <SectionTitle>Per-Strategy BGA Impact</SectionTitle>
        <div className="space-y-0">
          {STRATEGIES.map((s) => (
            <div key={s.id} className="flex items-start gap-4 py-4 border-b border-mantle-border last:border-0">
              <span className="text-xl shrink-0 mt-0.5">{s.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-white">{s.name}</span>
                  <Badge variant={{ Low: "green", Medium: "amber", High: "red" }[s.risk] as any} className="text-[10px]">
                    {s.risk} Risk
                  </Badge>
                </div>
                <p className="text-xs text-mantle-muted leading-relaxed">{s.bgaAlignment}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA */}
      <div className="text-center py-8 rounded-2xl border border-mantle-border bg-[#13131F]">
        <h2 className="text-lg font-semibold text-white mb-2">
          Ready to trade like an institution?
        </h2>
        <p className="text-sm text-mantle-muted mb-5 max-w-md mx-auto">
          Connect your wallet, choose a strategy, and deploy your first AI agent —
          no money required, no KYC, no subscriptions.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/strategies">
            <Button variant="primary">Deploy AI Agent →</Button>
          </Link>
          <Link href="/transparency">
            <Button variant="outline">View Strategy Logic →</Button>
          </Link>
        </div>
        <p className="text-xs text-mantle-muted mt-4">
          Built for the Blockchain for Good Alliance track · Turing Test Hackathon 2026
        </p>
      </div>
    </div>
  );
}
