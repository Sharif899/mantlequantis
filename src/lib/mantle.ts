import { ethers } from "ethers";
import type { Trade } from "@/types";

export const MANTLE_SEPOLIA_RPC = "https://rpc.sepolia.mantle.xyz";
export const MANTLE_EXPLORER = "https://explorer.sepolia.mantle.xyz";

export const TRADE_LOGGER_ABI = [
  "event TradeLogged(address indexed trader, string pair, string side, uint256 amount, uint256 price, uint256 timestamp, string strategyId)",
  "event AgentRegistered(address indexed owner, string strategyId, string strategyName, uint256 timestamp)",
  "function logTrade(string pair, string side, uint256 amountUsdt, uint256 priceScaled, string strategyId) external",
  "function registerAgent(string strategyId, string strategyName) external",
  "function getTraderCount() external view returns (uint256)",
  "function getMyTradeCount() external view returns (uint256)",
];

export const TRADE_LOGGER_ADDRESS =
  process.env.NEXT_PUBLIC_TRADE_LOGGER_ADDRESS || "";

export function getMantleProvider() {
  return new ethers.JsonRpcProvider(MANTLE_SEPOLIA_RPC);
}

export async function logTradeOnChain(
  signer: ethers.Signer,
  trade: Omit<Trade, "txHash">
): Promise<string | null> {
  if (!TRADE_LOGGER_ADDRESS) return null;
  try {
    const contract = new ethers.Contract(
      TRADE_LOGGER_ADDRESS,
      TRADE_LOGGER_ABI,
      signer
    );
    const tx = await contract.logTrade(
      trade.pair,
      trade.side,
      Math.round(trade.amount * 100),
      Math.round(trade.entryPrice * 10000),
      trade.strategy
    );
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (err) {
    console.error("On-chain log failed:", err);
    return null;
  }
}

export function getExplorerTxUrl(txHash: string) {
  return `${MANTLE_EXPLORER}/tx/${txHash}`;
}

export async function fetchOnChainTrades(traderAddress: string) {
  if (!TRADE_LOGGER_ADDRESS) return [];
  try {
    const provider = getMantleProvider();
    const contract = new ethers.Contract(
      TRADE_LOGGER_ADDRESS,
      TRADE_LOGGER_ABI,
      provider
    );
    const filter = contract.filters.TradeLogged(traderAddress);
    const events = await contract.queryFilter(filter, -10000);
    return events.map((e: ethers.EventLog | ethers.Log) => {
      const log = e as ethers.EventLog;
      return {
        txHash: log.transactionHash,
        pair: log.args?.[1],
        side: log.args?.[2],
        amount: Number(log.args?.[3]) / 100,
        price: Number(log.args?.[4]) / 10000,
        timestamp: Number(log.args?.[5]),
        strategyId: log.args?.[6],
      };
    });
  } catch {
    return [];
  }
}