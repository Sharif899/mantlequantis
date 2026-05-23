import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trade, Agent, PaperPortfolio } from "@/types";
import { nanoid } from "nanoid";

// nanoid inline since we don't want an extra dep
function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

interface StoreState {
  portfolio: PaperPortfolio;
  agents: Agent[];
  selectedPair: string;
  setSelectedPair: (pair: string) => void;
  executeTrade: (params: {
    pair: string;
    side: "buy" | "sell";
    amountUsdt: number;
    price: number;
    strategy: string;
    txHash?: string;
  }) => Trade | null;
  deployAgent: (agent: Omit<Agent, "id" | "startedAt" | "trades" | "pnl">) => void;
  stopAgent: (agentId: string) => void;
  agentTick: (agentId: string, pnlDelta: number, pair: string, price: number) => void;
  resetPortfolio: () => void;
}

const INITIAL_PORTFOLIO: PaperPortfolio = {
  cash: 10000,
  positions: {},
  totalValue: 10000,
  totalPnl: 0,
  totalPnlPct: 0,
  trades: [],
  equityCurve: [{ time: Date.now(), value: 10000 }],
};

function computePortfolioValue(
  cash: number,
  positions: PaperPortfolio["positions"]
): number {
  return (
    cash +
    Object.values(positions).reduce(
      (sum, p) => sum + p.size * p.currentPrice,
      0
    )
  );
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      portfolio: INITIAL_PORTFOLIO,
      agents: [],
      selectedPair: "MNT/USDT",

      setSelectedPair: (pair) => set({ selectedPair: pair }),

      executeTrade: ({ pair, side, amountUsdt, price, strategy, txHash }) => {
        const { portfolio } = get();
        const size = amountUsdt / price;

        if (side === "buy") {
          if (portfolio.cash < amountUsdt) return null;

          const existingPos = portfolio.positions[pair];
          const newSize = (existingPos?.size || 0) + size;
          const newAvg = existingPos
            ? (existingPos.avgPrice * existingPos.size + price * size) / newSize
            : price;

          const newCash = portfolio.cash - amountUsdt;
          const newPositions = {
            ...portfolio.positions,
            [pair]: {
              pair,
              size: newSize,
              avgPrice: newAvg,
              currentPrice: price,
              unrealizedPnl: (price - newAvg) * newSize,
              unrealizedPnlPct: ((price - newAvg) / newAvg) * 100,
            },
          };
          const newValue = computePortfolioValue(newCash, newPositions);
          const trade: Trade = {
            id: generateId(),
            pair,
            side,
            amount: amountUsdt,
            size,
            entryPrice: price,
            strategy,
            timestamp: Date.now(),
            txHash,
            status: "open",
          };

          set({
            portfolio: {
              ...portfolio,
              cash: newCash,
              positions: newPositions,
              totalValue: newValue,
              totalPnl: newValue - 10000,
              totalPnlPct: ((newValue - 10000) / 10000) * 100,
              trades: [...portfolio.trades, trade],
              equityCurve: [
                ...portfolio.equityCurve,
                { time: Date.now(), value: newValue },
              ],
            },
          });
          return trade;
        } else {
          // sell
          const pos = portfolio.positions[pair];
          if (!pos || pos.size < size) return null;

          const pnl = (price - pos.avgPrice) * size;
          const newPosSize = pos.size - size;
          const newCash = portfolio.cash + amountUsdt;
          const newPositions = { ...portfolio.positions };

          if (newPosSize < 0.0001) {
            delete newPositions[pair];
          } else {
            newPositions[pair] = { ...pos, size: newPosSize };
          }

          const newValue = computePortfolioValue(newCash, newPositions);
          const trade: Trade = {
            id: generateId(),
            pair,
            side,
            amount: amountUsdt,
            size,
            entryPrice: pos.avgPrice,
            exitPrice: price,
            pnl,
            pnlPct: (pnl / (pos.avgPrice * size)) * 100,
            strategy,
            timestamp: Date.now(),
            txHash,
            status: "closed",
          };

          set({
            portfolio: {
              ...portfolio,
              cash: newCash,
              positions: newPositions,
              totalValue: newValue,
              totalPnl: newValue - 10000,
              totalPnlPct: ((newValue - 10000) / 10000) * 100,
              trades: [...portfolio.trades, trade],
              equityCurve: [
                ...portfolio.equityCurve,
                { time: Date.now(), value: newValue },
              ],
            },
          });
          return trade;
        }
      },

      deployAgent: (agentData) => {
        const agent: Agent = {
          ...agentData,
          id: generateId(),
          startedAt: Date.now(),
          trades: 0,
          pnl: 0,
        };
        set((s) => ({ agents: [...s.agents, agent] }));
      },

      stopAgent: (agentId) => {
        set((s) => ({
          agents: s.agents.map((a) =>
            a.id === agentId ? { ...a, active: false } : a
          ),
        }));
      },

      agentTick: (agentId, pnlDelta, pair, price) => {
        set((s) => {
          const newAgents = s.agents.map((a) =>
            a.id === agentId
              ? { ...a, trades: a.trades + 1, pnl: a.pnl + pnlDelta }
              : a
          );
          const newValue =
            s.portfolio.totalValue + pnlDelta;
          return {
            agents: newAgents,
            portfolio: {
              ...s.portfolio,
              cash: s.portfolio.cash + pnlDelta,
              totalValue: newValue,
              totalPnl: newValue - 10000,
              totalPnlPct: ((newValue - 10000) / 10000) * 100,
              equityCurve: [
                ...s.portfolio.equityCurve.slice(-500),
                { time: Date.now(), value: newValue },
              ],
            },
          };
        });
      },

      resetPortfolio: () =>
        set({ portfolio: INITIAL_PORTFOLIO, agents: [] }),
    }),
    {
      name: "mantlequant-store",
      partialize: (s) => ({ portfolio: s.portfolio, agents: s.agents }),
    }
  )
);
