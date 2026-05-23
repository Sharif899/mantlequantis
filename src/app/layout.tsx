"use client";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import Navbar from "@/components/ui/Navbar";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>MantleQuant — AI Trading Platform</title>
        <meta name="description" content="AI-powered paper trading on Mantle Network. Deploy autonomous agents, track performance on-chain." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-mantle-bg text-white min-h-screen">
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={darkTheme({
                accentColor: "#7F77DD",
                accentColorForeground: "white",
                borderRadius: "medium",
              })}
            >
              <Navbar />
              <main className="pt-16">{children}</main>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
