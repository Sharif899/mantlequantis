# MantleQuant — AI Trading Platform

> Turing Test Hackathon 2026 — AI Trading & Strategy Track (BGA aligned)

AI-powered paper trading platform on Mantle Network. Deploy autonomous trading agents, track performance, and log every trade on-chain for full transparency.

## 🚀 Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/mantlequant
cd mantlequant
npm install
cp .env.example .env.local
```

Fill in `.env.local`:
- Get a **free** WalletConnect Project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com)
- Everything else works with no API key

```bash
npm run dev
# → http://localhost:3000
```

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variables from `.env.local`
4. Deploy ✅

## 📜 Deploy Smart Contract to Mantle Sepolia

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

Add to `hardhat.config.js`:
```js
networks: {
  mantleSepolia: {
    url: "https://rpc.sepolia.mantle.xyz",
    chainId: 5003,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

Deploy:
```bash
npx hardhat run scripts/deploy.js --network mantleSepolia
```

Then add the contract address to `.env.local`:
```
NEXT_PUBLIC_TRADE_LOGGER_ADDRESS=0x...
```

Get testnet MNT from [faucet.sepolia.mantle.xyz](https://faucet.sepolia.mantle.xyz)

## 🆓 Free APIs Used

| API | Purpose | Auth Required |
|-----|---------|--------------|
| Bybit WebSocket `wss://stream.bybit.com/v5/public/spot` | Live prices, order book | ❌ None |
| Bybit REST `https://api.bybit.com/v5/market/kline` | Historical OHLC candles | ❌ None |
| CoinGecko `https://api.coingecko.com/api/v3` | MNT price + market cap | ❌ None |
| Mantle Sepolia RPC `https://rpc.sepolia.mantle.xyz` | On-chain tx logging | ❌ None |
| Mantle Explorer `https://explorer.sepolia.mantle.xyz` | View on-chain trades | ❌ None |
| WalletConnect | Wallet connection | ✅ Free project ID |

## 🏗️ Architecture

```
src/
├── app/
│   ├── page.tsx              # Overview / home
│   ├── dashboard/page.tsx    # Portfolio analytics
│   ├── strategies/page.tsx   # Deploy AI agents
│   ├── trade/page.tsx        # Paper trading + order book
│   ├── analytics/page.tsx    # Smart money + on-chain data
│   └── leaderboard/page.tsx  # Rankings
├── components/
│   ├── ui/                   # Card, Badge, Button, etc.
│   ├── charts/               # Recharts wrappers
│   └── trading/              # OrderBook, TickerBar
├── lib/
│   ├── bybit.ts              # Bybit WS + REST (free, no auth)
│   ├── mantle.ts             # On-chain trade logger
│   ├── strategies.ts         # 6 AI strategy definitions + signal logic
│   ├── store.ts              # Zustand global state
│   └── wagmi.ts              # Wagmi + RainbowKit config
└── types/index.ts            # TypeScript types

contracts/
└── MantleQuantTradeLogger.sol  # Deploy on Mantle Sepolia
```

## 🎯 Hackathon Features

- **Real Bybit data** — live prices via WebSocket, no auth needed
- **Wallet connection** — RainbowKit with Mantle Sepolia network
- **Paper trading** — $10,000 virtual starting balance, full P&L tracking
- **6 AI strategies** — Momentum, Mean Reversion, Smart Money, RWA Yield, Arb, ML
- **On-chain logging** — every trade logged to Mantle Sepolia (transparency criterion)
- **ERC-8004 inspired** — agent identity system via smart contract
- **BGA alignment** — democratizing institutional quant strategies for retail

## 🌍 BGA Track Alignment

MantleQuant directly addresses financial inclusion by:
1. Giving retail traders the same AI quant tools used by institutions
2. Paper trading eliminates financial risk for learning
3. Full on-chain transparency — no black box AI
4. Open-source strategy logic, anyone can audit decisions

## 📋 Submission

- Tweet with `#MantleAIHackathon` including demo video + GitHub link + Mantle contract address
- Submit on [DoraHacks](https://dorahacks.io/hackathon/turing-test/detail)
- Deadline: **June 15, 2026 16:59 UTC**
