"use client";
import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = process.env.NEXT_PUBLIC_RPC_URL;
  const wallets = useMemo(() => [], [network]);
  return (
    <>
      <ConnectionProvider endpoint={endpoint || ""}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
}
