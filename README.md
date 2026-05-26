# MantleQuant — AI Trading Platform on Mantle Network

**MantleQuant** is an AI-powered paper trading platform built on Mantle Network. Deploy autonomous trading agents, track performance in real-time, and verify every trade on-chain. No black boxes. No subscriptions. No KYC.

🌐 **Live App:** https://mantlequantis.vercel.app
🎬 **Demo Video:** https://youtu.be/fsdB0M9e1Rw
📦 **GitHub:** https://github.com/Sharif899/mantlequantis
⛓️ **Contract (Mantle Sepolia):** `0x635bE4011599F7E258395D436ec7871895F6d471`

---

## What It Does

MantleQuant gives retail traders access to the same AI quant strategies used by institutional traders — for free. Deploy AI agents that trade autonomously, track every decision transparently, and verify every trade on Mantle blockchain.

- **6 AI trading agents** running 24/7 with real quant logic
- **Every trade logged on-chain** — verifiable, permanent, auditable
- **Real-time prices** — MNT, ETH, BTC live from CoinGecko
- **Paper trading** — $10,000 virtual portfolio, zero risk
- **Market & Limit orders** — just like a real exchange
- **Full transparency** — strategy pseudocode, AI decision log, on-chain audit

---

## AI Strategies

| Strategy | Logic | Risk |
|---|---|---|
| **Momentum Surfer** | RSI + dual EMA crossover | Medium |
| **Mean Reversion** | Bollinger Bands + RSI | Low |
| **Smart Money Tracker** | On-chain whale wallet following | Medium |
| **RWA Yield Hunter** | APY rotation between USDY, mETH, fBTC | Low |
| **Cross-Pool Arb** | Price discrepancy between Merchant Moe & Agni Finance | Low |
| **ML Price Predictor** | Logistic regression on 12 technical features | High |

---

## Pages

| Page | Description |
|---|---|
| **Overview** | Live prices, portfolio performance, AI signals, Mantle ecosystem |
| **Dashboard** | Equity curve, open positions, trade history, win rate, Sharpe ratio |
| **Strategies** | Deploy AI agents on Mantle Sepolia, run backtests |
| **Trade** | Market & limit orders, live order book, 15m price chart |
| **Analytics** | Smart money signals, pool data, on-chain anomaly detection |
| **Transparency** | Strategy logic, AI decisions, on-chain audit trail |
| **Leaderboard** | Agent performance rankings |
| **BGA** | Financial inclusion mission — democratizing quant trading |

---

## Smart Contract

**Address:** `0x635bE4011599F7E258395D436ec7871895F6d471`
**Network:** Mantle Sepolia Testnet (Chain ID: 5003)
**Explorer:** https://explorer.sepolia.mantle.xyz/address/0x635bE4011599F7E258395D436ec7871895F6d471

```solidity
// Log every paper trade permanently on Mantle
function logTrade(string pair, string side, uint256 amount, uint256 price, string strategyId) external

// Register each AI agent with an on-chain identity (ERC-8004 inspired)
function registerAgent(string strategyId, string strategyName) external
```

Every trade execution emits a `TradeLogged` event. Every agent deployment emits an `AgentRegistered` event. Both are permanently verifiable on Mantle Sepolia Explorer.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Wallet | RainbowKit + Wagmi + ethers.js |
| Charts | Recharts |
| State | Zustand |
| Prices | CoinGecko API (free tier) |
| On-chain | Mantle Sepolia, Solidity 0.8.20 |
| Deploy | Vercel |

---

## Quick Start

```bash
git clone https://github.com/Sharif899/mantlequantis.git
cd mantlequantis
npm install
cp .env.example .env.local
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id        # free at cloud.walletconnect.com
NEXT_PUBLIC_TRADE_LOGGER_ADDRESS=0x635bE4011599F7E258395D436ec7871895F6d471
COINGECKO_API_KEY=your_key                          # free at coingecko.com/api
```

---

## Why This Matters

Institutional traders spend millions on proprietary algorithms, real-time whale data, and quant expertise. Retail traders have none of this.

MantleQuant closes that gap:

- **$0 to start** — no minimum balance, no KYC, no subscriptions
- **Same strategies** — Momentum, Mean Reversion, Smart Money, ML — all free
- **On-chain credibility** — verifiable performance record without a bank account
- **Global access** — works in 195+ countries with just a Web3 wallet

---

## Roadmap

- [ ] Mainnet deployment on Mantle
- [ ] Real trading via Merchant Moe SDK
- [ ] Bybit API integration for CEX execution
- [ ] Global leaderboard via Supabase
- [ ] Strategy marketplace as NFTs
- [ ] Mobile app

---

Built by **Sharif899** · [Twitter](https://x.com/Sharif899)

*Paper trading only. All trades use virtual funds. Not financial advice.*
