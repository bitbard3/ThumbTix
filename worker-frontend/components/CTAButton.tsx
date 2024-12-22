"use client";
import React from "react";
import ShinyButton from "@/components/ui/ShinyButton";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";
export default function CTAButton() {
  const { setVisible } = useWalletModal();
  const router = useRouter();
  const handleClick = async () => {
    if (typeof window !== "undefined" ? localStorage.getItem("token") : null) {
      router.push("nexttask");
    } else {
      if (localStorage.getItem("walletName")) {
        toast.error("Please authenticate to continue", {
          classNames: {
            toast: "toast-error",
          },
        });
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
