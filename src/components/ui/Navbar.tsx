"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useStore } from "@/lib/store";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/strategies", label: "Strategies" },
  { href: "/trade", label: "Trade" },
  { href: "/analytics", label: "Analytics" },
  { href: "/transparency", label: "Transparency" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/bga", label: "🌍 BGA", highlight: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const { portfolio, agents } = useStore();
  const pnl = portfolio.totalPnl;
  const pnlPct = portfolio.totalPnlPct;
  const activeAgents = agents.filter((a) => a.active).length;
  const onChainTrades = portfolio.trades.filter((t) => t.txHash).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-mantle-card border-b border-mantle-border flex items-center px-4 gap-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-4 shrink-0">
        <img src="/logo.png" alt="MantleQuant" className="h-8 w-auto" />
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-0 flex-1 overflow-x-auto hide-scrollbar">
        {NAV_LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "px-3 h-16 flex items-center text-xs font-medium whitespace-nowrap transition-colors border-b-2",
                active
                  ? "text-mantle-purple border-mantle-purple"
                  : link.highlight
                  ? "text-mantle-teal border-transparent hover:text-white"
                  : "text-mantle-muted border-transparent hover:text-white"
              )}
            >
              {link.label}
              {link.label === "Strategies" && activeAgents > 0 && (
                <span className="ml-1.5 bg-mantle-purple text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeAgents}
                </span>
              )}
              {link.label === "Transparency" && onChainTrades > 0 && (
                <span className="ml-1.5 bg-mantle-teal text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {onChainTrades}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Portfolio mini stat */}
      <div className="hidden lg:flex items-center gap-3 mr-4 shrink-0">
        <div className="text-right">
          <div className="text-[10px] text-mantle-muted">Portfolio</div>
          <div className="text-xs font-semibold num">
            ${portfolio.totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className={clsx("text-xs font-semibold num", pnl >= 0 ? "text-mantle-teal" : "text-mantle-coral")}>
          {pnl >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
        </div>
        {onChainTrades > 0 && (
          <div className="text-[10px] text-mantle-muted">
            <span className="live-dot mr-1" />
            {onChainTrades} on-chain
          </div>
        )}
      </div>

      {/* Wallet connect */}
      <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
    </nav>
  );
}