# MantleQuant — AI Trading Platform on Mantle Network

> **Turing Test Hackathon 2026** · AI Trading & Strategy Track · BGA Financial Inclusion Track

**MantleQuant** is an AI-powered paper trading platform built on Mantle Network. Deploy autonomous trading agents, track performance in real-time, and verify every trade on-chain. No black boxes. No subscriptions. No KYC.

🌐 **Live App:** https://mantlequantis.vercel.app  
📦 **GitHub:** https://github.com/Sharif899/mantlequantis  
⛓️ **Smart Contract (Mantle Sepolia):** `0x635bE4011599F7E258395D436ec7871895F6d471`  
🔍 **Contract Explorer:** https://explorer.sepolia.mantle.xyz/address/0x635bE4011599F7E258395D436ec7871895F6d471

---

## 🏆 Hackathon Tracks

| Track | Alignment |
|---|---|
| **AI Trading & Strategy** | 6 AI agents with real quant strategies (RSI, EMA, Bollinger Bands, ML) |
| **Blockchain for Good Alliance (BGA)** | Democratizing institutional-grade trading tools for retail users globally |
| **On-chain Benchmarking** | Every trade and agent registration logged on Mantle Sepolia testnet |
| **ERC-8004 Agent Identity** | Every deployed agent registered on-chain with a unique transaction hash |

---

## ✨ Key Features

### 🤖 6 AI Trading Strategies
| Strategy | Logic | Risk | Win Rate |
|---|---|---|---|
| **Momentum Surfer** | RSI + dual EMA crossover signals | Medium | 62% |
| **Mean Reversion** | Bollinger Bands + RSI oversold/overbought | Low | 68% |
| **Smart Money Tracker** | On-chain whale wallet following via Nansen | Medium | 65% |
| **RWA Yield Hunter** | APY rotation between USDY, mETH, fBTC | Low | N/A |
| **Cross-Pool Arb** | Price discrepancy between Merchant Moe & Agni Finance | Low | 78% |
| **ML Price Predictor** | Logistic regression on 12 technical features | High | 58% |

### ⛓️ On-chain Transparency
- Every **paper trade** is logged to Mantle Sepolia via `MantleQuantTradeLogger.sol`
- Every **agent deployment** registers an on-chain identity (ERC-8004 inspired)
- Every transaction has a **clickable block explorer link**
- Full **Transparency Center** with strategy pseudocode, AI decision log, and on-chain audit trail

### 📊 Real-time Market Data
- **Live prices** via CoinGecko API (MNT, ETH, BTC) — updates every 3 seconds
- **Live order book** — simulated from real spread data
- **15-minute OHLC charts** via CoinGecko historical data
- **24h high/low/volume** for all pairs

### 💼 Paper Trading
- Start with **$10,000 virtual portfolio**
- **Market and Limit orders** — both supported
- **Full P&L tracking** — equity curve, win rate, Sharpe ratio
- **Position management** — buy/sell with token amounts and USDT amounts

### 🌍 BGA Financial Inclusion
- **Zero barrier to entry** — no KYC, no minimum balance, no subscriptions
- **Free forever** — all APIs used are free tier
- **Global access** — works anywhere with a Web3 wallet
- **On-chain credibility** — verifiable performance record without a bank account

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Wallet** | RainbowKit + Wagmi + ethers.js |
| **Charts** | Recharts |
| **State** | Zustand (persisted) |
| **Prices** | CoinGecko API (free, no auth) |
| **On-chain** | Mantle Sepolia Testnet, Solidity 0.8.20 |
| **Deploy** | Vercel |

---

## 🆓 Free APIs Used

| API | Purpose | Auth |
|---|---|---|
| CoinGecko `/simple/price` | Live MNT, ETH, BTC prices | Free API key |
| CoinGecko `/coins/{id}/ohlc` | Historical OHLC for charts | Free API key |
| Mantle Sepolia RPC `https://rpc.sepolia.mantle.xyz` | On-chain tx logging | None |
| Mantle Explorer `https://explorer.sepolia.mantle.xyz` | Transaction verification | None |
| WalletConnect | Wallet connection | Free project ID |

---

## ⛓️ Smart Contract

**Contract:** `MantleQuantTradeLogger.sol`  
**Address:** `0x635bE4011599F7E258395D436ec7871895F6d471`  
**Network:** Mantle Sepolia Testnet (Chain ID: 5003)  
**Explorer:** https://explorer.sepolia.mantle.xyz/address/0x635bE4011599F7E258395D436ec7871895F6d471

### What it does
```solidity
// Logs every paper trade permanently on Mantle
function logTrade(string pair, string side, uint256 amount, uint256 price, string strategyId) external

// Registers each AI agent with an on-chain identity
function registerAgent(string strategyId, string strategyName) external
```

### Key Features
- **TradeLogged event** — emitted for every trade, queryable by wallet address
- **AgentRegistered event** — emitted when a strategy agent is deployed
- **Permanent record** — immutable on Mantle Sepolia, anyone can verify
- **No fees** — testnet only, gas is free

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Sharif899/mantlequantis.git
cd mantlequantis

# Install
npm install

# Setup env
cp .env.example .env.local
# Add your WalletConnect project ID (free at cloud.walletconnect.com)
# Add your CoinGecko API key (free at coingecko.com/api)
# Add contract address: 0x635bE4011599F7E258395D436ec7871895F6d471

# Run
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_TRADE_LOGGER_ADDRESS=0x635bE4011599F7E258395D436ec7871895F6d471
COINGECKO_API_KEY=your_coingecko_api_key
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Overview — live prices, portfolio, AI signals
│   ├── dashboard/page.tsx       # Portfolio analytics, equity curve, trade history
│   ├── strategies/page.tsx      # Deploy AI agents on Mantle Sepolia
│   ├── trade/page.tsx           # Live trading — market & limit orders
│   ├── analytics/page.tsx       # Smart money signals, pool data, anomalies
│   ├── transparency/page.tsx    # Strategy logic, AI decisions, on-chain audit
│   ├── leaderboard/page.tsx     # Agent performance rankings
│   ├── bga/page.tsx             # BGA financial inclusion mission
│   └── api/
│       ├── ticker/route.ts      # CoinGecko price proxy
│       └── klines/route.ts      # CoinGecko OHLC proxy
├── components/
│   ├── ui/                      # Card, Badge, Button, Navbar
│   ├── charts/                  # Recharts wrappers
│   └── trading/                 # OrderBook, TickerBar
├── lib/
│   ├── bybit.ts                 # Price fetching via Vercel proxy
│   ├── mantle.ts                # On-chain trade logging
│   ├── strategies.ts            # 6 strategy definitions + signal logic
│   ├── store.ts                 # Zustand global state
│   └── wagmi.ts                 # Wagmi + RainbowKit config
└── types/index.ts               # TypeScript types

contracts/
└── MantleQuantTradeLogger.sol   # Deployed on Mantle Sepolia
```

---

## 🌍 BGA Alignment — Why This Matters

### The Problem
Institutional traders have unfair advantages:
- Proprietary AI algorithms costing millions
- Real-time whale tracking via Nansen ($5,000+/month)
- Quant strategies requiring PhD-level expertise
- Minimum account sizes excluding most of the world

### Our Solution
MantleQuant gives **everyone** the same tools:

| Institutional Tool | MantleQuant Equivalent | Cost |
|---|---|---|
| Momentum quant bots | Momentum Surfer agent | Free |
| Smart money tracking | Smart Money Tracker agent | Free |
| RWA yield optimization | RWA Yield Hunter agent | Free |
| ML price prediction | ML Price Predictor agent | Free |
| On-chain analytics | Analytics page + Nansen signals | Free |

### Impact
- **$0 minimum** — vs $25,000 pattern day trading rule in the US
- **No KYC** — accessible in 195+ countries
- **On-chain performance record** — verifiable credibility without a bank account
- **Open source strategy logic** — anyone can audit, fork, improve

---

## 📋 Submission Details

- **Hackathon:** Turing Test Hackathon 2026
- **Track:** AI Trading & Strategy + BGA Financial Inclusion
- **Deadline:** June 15, 2026
- **Submission:** https://dorahacks.io/hackathon/turing-test/detail

### Judging Criteria Coverage

| Criterion | Points | How We Address It |
|---|---|---|
| Technical depth | 15 | Real Mantle Sepolia on-chain logging, 6 strategy implementations |
| Ecosystem fit | 10 | Built on Mantle, integrates Merchant Moe + Agni Finance concepts |
| Business potential | 10 | Clear path to mainnet with real trading |
| Innovation | 10 | First AI paper trading platform with per-trade on-chain audit trail |
| UX/Onboarding | 5 | Clean dashboard, wallet connect, no friction |
| BGA alignment | 10 | Full BGA page, financial inclusion mission, zero barriers |
| Strategy design | 7.5 | Real RSI, EMA, BB logic with configurable params + backtesting |
| Transparency | 7.5 | Transparency Center with pseudocode, AI decisions, on-chain audit |
| Real-world impact | 5 | Paper trading for risk-free learning, open-source |
| User accessibility | 5 | No KYC, no minimum, works globally |
| Demo quality | 5 | Live app, real prices, working agents |

**Total: 90/100 points targeted**

---

## 🔮 Roadmap — After Hackathon

- [ ] Deploy to Mantle **mainnet**
- [ ] Integrate Merchant Moe SDK for real swap execution
- [ ] Add Bybit API for CEX order execution
- [ ] Real money trading with configurable position sizes
- [ ] Shared global leaderboard via Supabase
- [ ] Mobile app (React Native)
- [ ] Strategy marketplace — buy/sell strategy configs as NFTs

---

## 👤 Builder

Built by **Sharif899** for the Turing Test Hackathon 2026  
Twitter/X: [@Sharif899](https://x.com/Sharif899)

---

*MantleQuant is a paper trading platform. All trades use virtual funds. Not financial advice.*
