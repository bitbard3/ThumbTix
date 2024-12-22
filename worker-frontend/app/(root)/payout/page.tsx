"use client";
import withAuth from "@/components/hoc/withAuth";
import { PayoutForm } from "@/components/PayoutForm";
import { StaggeredBlurIn } from "@/components/ui/StaggeredBlurIn";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface Amount {
  pendingAmount: number;
  lockedAmount: number;
}

const Payout = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const LAMPORTS_DECIMAL = 1000000000;
  const [amount, setAmount] = useState<Amount | null>(null);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(true);

  useEffect(() => {
    const getBalance = async () => {
      setBalanceLoading(true);
      try {
        const res = await axios.get(`${BACKEND_URL}/balance`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });

        setAmount({
          pendingAmount:
            Number(res.data.balance.pendingAmount) / LAMPORTS_DECIMAL,
          lockedAmount:
            Number(res.data.balance.lockedAmount) / LAMPORTS_DECIMAL,
        });
      } catch (error) {
        console.log(error);
        toast.error("Error loading balances", {
          classNames: {
            toast: "toast-error",
          },
        });
      } finally {
        setBalanceLoading(false);
      }
    };
    getBalance();
  }, []);
  if (balanceLoading) {
    return (
      <div className="h-screen flex justify-center flex-col">
        <div className="w-full flex justify-center text-2xl">Loading...</div>
      </div>
    );
  }
  return (
    <>
      <div className="bg-black min-h-screen w-screen overflow-hidden">
        <StaggeredBlurIn staggerDelay={0.3} duration={0.8}>
          <div className="main__container w-full">
            <div className="flex flex-col items-center justify-center w-full min-h-screen  inner__container">
              <div className="mx-auto flex flex-col ">
                <div className="flex gap-16 items-center px-3 py-3 border-b w-full  justify-between">
                  <p className="text-white text-lg font-medium">
                    Pending Amount
                  </p>
                  <p className="text-white text-lg font-medium">
                    {amount?.pendingAmount} SOL
                  </p>
                </div>
                <div className="flex gap-16 items-center px-3 py-3 w-full justify-between ">
                  <p className="text-white text-lg font-medium">
                    Locked Amount
                  </p>
                  <p className="text-white text-lg font-medium">
                    {amount?.lockedAmount} SOL
                  </p>
                </div>
                <PayoutForm
                  setAmount={(pendingAmount: number, lockedAmount: number) => {
                    setAmount((prev) => ({
                      ...prev,
                      pendingAmount,
                      lockedAmount,
                    }));
                  }}
                  lockedAmount={amount?.lockedAmount || 0}
                  pendingAmount={amount?.pendingAmount || 0}
                />
              </div>
            </div>
          </div>
        </StaggeredBlurIn>
      </div>
    </>
  );
};
export default withAuth(Payout);
