import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// Mantle Sepolia Testnet (use for hackathon demo)
export const mantleSepolia = defineChain({
  id: 5003,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia.mantle.xyz"] },
    public: { http: ["https://rpc.sepolia.mantle.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Mantle Sepolia Explorer",
      url: "https://explorer.sepolia.mantle.xyz",
    },
  },
  testnet: true,
});

// Mantle Mainnet
export const mantleMainnet = defineChain({
  id: 5000,
  name: "Mantle",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mantle.xyz"] },
    public: { http: ["https://rpc.mantle.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Mantle Explorer",
      url: "https://explorer.mantle.xyz",
    },
  },
});

export const wagmiConfig = getDefaultConfig({
  appName: "MantleQuant",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [mantleSepolia, mantleMainnet],
  ssr: true,
});
