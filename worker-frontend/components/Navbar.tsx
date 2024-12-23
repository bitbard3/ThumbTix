"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { StaggeredBlurIn } from "@/components/ui/StaggeredBlurIn";
import React, { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Check, Menu, X } from "lucide-react";
import Loader from "./ui/loader";
import { toast } from "sonner";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Navbar() {
  const { publicKey, signMessage } = useWallet();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [loading, setLoading] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const verifyWallet = async () => {
    if (!publicKey) {
      return;
    }
    if (token) {
      return;
    }
    const message = new TextEncoder().encode(
      `${
        window.location.host
      } wants you to sign in with your Solana account:\n${publicKey.toBase58()}\n\nPlease sign in.`
    );
    try {
      setLoading(true);
      const signature = await signMessage?.(message);
      if (signature) {
        const res = await axios.post(`${BACKEND_URL}/signin`, {
          publicKey: publicKey.toBase58(),
          signature: Buffer.from(signature).toString("base64"),
          message: Buffer.from(message).toString("utf-8"),
        });
        localStorage.setItem("token", res.data.token);
        toast.success("Wallet verified", {
          classNames: {
            toast: "toast-success",
          },
        });
      }
    } catch (error) {
      toast.error("Authentication failed", {
        description: "Please try again",
        classNames: {
          toast: "toast-error",
        },
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StaggeredBlurIn
      className="fixed top-0 left-0 z-50"
      duration={0.5}
      staggerDelay={0.1}
    >
      <div className="w-full  border-b border-neutral-700 border-opacity-70 bg-black">
        <div className="max-w-[1280px] mx-auto px-10">
          <div className="flex items-center justify-between py-4">
            <Link href={"/"}>
              <h3 className="text-white font-medium text-lg">
                ThumbTix(Worker)
              </h3>
            </Link>

            <div className="lg:hidden z-[99] flex items-center">
              <button
                className="text-white focus:outline-none"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            <div className="hidden lg:flex  items-center gap-x-4">
              {token && (
                <>
                  <Link href={"/nexttask"}>
                    <p className="text-neutral-400 hover:text-white font-medium mr-8 ">
                      Tasks
                    </p>
                  </Link>
                  <Link href={"/payout"}>
                    <p className="text-neutral-400 hover:text-white font-medium mr-8 ">
                      Payout
                    </p>
                  </Link>
                </>
              )}
              {publicKey &&
                (!token ? (
                  <Button
                    className="text-[16px] leading-[48px]"
                    variant={"secondary"}
                    onClick={verifyWallet}
                    disabled={loading}
                  >
                    {loading && <Loader className={"h-5 w-5"} />}
                    Authenticate
                  </Button>
                ) : (
                  <div className="p-1 rounded-full bg-green-500 bg-opacity-80">
                    <Check color="#fff" />
                  </div>
                ))}
              {publicKey ? (
                <WalletDisconnectButton
                  onClick={() => localStorage.removeItem("token")}
                />
              ) : (
                <WalletMultiButton />
              )}
            </div>
            {isMenuOpen && (
              <div className="fixed top-0 right-0 w-[60%] bg-slate-600 rounded-bl-md  p-5 flex flex-col gap-4 z-50 lg:hidden">
                <Link href="/nexttask" onClick={toggleMenu}>
                  <p className="text-white font-medium">Tasks</p>
                </Link>
                <Link href="/payout" onClick={toggleMenu}>
                  <p className="text-white font-medium">Payout</p>
                </Link>
                {publicKey &&
                  (!token ? (
                    <Button
                      className="text-[16px] leading-[48px]"
                      variant="secondary"
                      onClick={() => {
                        verifyWallet();
                        toggleMenu();
                      }}
                      disabled={loading}
                    >
                      {loading && <Loader className="h-5 w-5" />}
                      Authenticate
                    </Button>
                  ) : (
                    <div className="p-1 rounded-full flex items-center justify-center font-medium  bg-green-500 bg-opacity-80">
                      <p className="text-white">Authenticated</p>
                    </div>
                  ))}
                {publicKey ? (
                  <WalletDisconnectButton
                    onClick={() => {
                      localStorage.removeItem("token");
                      toggleMenu();
                    }}
                  />
                ) : (
                  <WalletMultiButton />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaggeredBlurIn>
  );
}
