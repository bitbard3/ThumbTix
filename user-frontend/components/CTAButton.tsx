"use client";
import React from "react";
import ShinyButton from "@/components/ui/ShinyButton";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function CTAButton() {
  const { setVisible } = useWalletModal();
  const router = useRouter();

  const handleClick = async () => {
    if (localStorage.getItem("token")) {
      router.push("/user/task");
    } else {
      if (localStorage.getItem("walletName")) {
        // TODO: Add toast to ask them to Authenticate
        return;
      }
      setVisible(true);
    }
  };

  return (
    <ShinyButton onClick={handleClick} className="mt-12">
      Get Started{" "}
      <MoveRight
        className="ml-1.5"
        strokeWidth={1}
        color="rgb(255,255,255,90%)"
      />{" "}
    </ShinyButton>
  );
}