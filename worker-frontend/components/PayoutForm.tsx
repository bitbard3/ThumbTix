"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Loader from "./ui/loader";
import { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface TaskFormProps {
  pendingAmount: number;
  lockedAmount: number;
  setAmount: (pendingAmount: number, lockedAmount: number) => void;
}

export function PayoutForm(props: TaskFormProps) {
  const FormSchema = z.object({
    amount: z.coerce
      .number({ message: "This field is required" })
      .positive({ message: "Amount should be a positive number" })
      .refine(
        (amount) => amount < props.pendingAmount,
        "Withdrawl amount cannot be more than pending amount!"
      ),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const [loading, setLoading] = useState<boolean>(false);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setLoading(true);
      const res = await axios.put(
        `${BACKEND_URL}/payout`,
        {
          amount: data.amount,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      // TODO: Add toast
      props.setAmount(
        res.data.balance.pendingAmount,
        res.data.balance.lockedAmount
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function onFormError(errors: FieldErrors<z.infer<typeof FormSchema>>) {
    // TODO: Add toasts
    console.log(errors.amount?.message);
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => onFormError(errors))}
        className="flex w-full max-w-sm items-center space-x-2 mt-4"
      >
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Enter the amount to withdraw" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={loading}>
          {loading && <Loader className={"h-5  w-5"} />}
          Withdraw
        </Button>
      </form>
    </Form>
  );
}
