"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ALLOWED_FILE_TYPE, MAX_FILE_SIZE } from "@/config/fileTypes";
import axios from "axios";
import { useState } from "react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Loader from "./ui/loader";
import { toast } from "sonner";

const FormSchema = z.object({
  title: z.string().min(1, { message: "This field is required" }),
  amount: z.coerce
    .number({ required_error: "This field is required" })
    .positive({ message: "Amount should be a positive number" }),
  files: z
    .array(
      z
        .custom<File>()
        .refine((file) => file instanceof File, "Please upload a file")
        .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB`)
        .refine(
          (file) => ALLOWED_FILE_TYPE.includes(file.type),
          "Only .jpg, .png, and .pdf files are accepted"
        )
    )
    .min(2, "Please upload at least two files")
    .max(5, "You can upload a maximum of 5 files"),
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;
const PARENT_WALLET = process.env.NEXT_PUBLIC_PARENT_PKEY;

type OptionType = {
  imageUrl: string;
};

export function TaskForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      amount: 0,
      files: [],
    },
  });
  const [txSign, setTxSign] = useState<string>("");
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState<boolean>(false);

  async function onSubmit(
    data: z.infer<typeof FormSchema> & { transactionSignature?: string }
  ) {
    try {
      const optionArray: OptionType[] = [];
      await Promise.all(
        data.files.map(async (file) => {
          toast(`Uploaded file ${file.name}`);
          const signedUrl = await axios.get(
            `${BACKEND_URL}/signedurl?filetype=${file.name.split(".")[1]}`,
            {
              headers: {
                Authorization: localStorage.getItem("token"),
              },
            }
          );
          await axios.put(signedUrl.data.url, file, {
            headers: {
              "Content-Type": file.type,
            },
          });
          optionArray.push({
            imageUrl: `${CDN_URL}/${signedUrl.data.fileName}`,
          });
        })
      );
      await axios.post(
        `${BACKEND_URL}/task`,
        {
          title: data.title,
          transactionSignature: txSign ? txSign : data.transactionSignature,
          options: optionArray,
          amount: data.amount,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      toast.success("Task Created", {
        classNames: { toast: "toast-success" },
      });
      form.reset();
      setTxSign("");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create task", {
        description: "Please try again",
        classNames: { toast: "toast-error" },
      });
    }
  }

  const onPayment = async (data: z.infer<typeof FormSchema>) => {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey!,
        toPubkey: new PublicKey(PARENT_WALLET || ""),
        lamports: data.amount * 1000000000,
      })
    );
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    try {
      setLoading(true);
      const signature = await sendTransaction(transaction, connection, {
        minContextSlot,
      });
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });
      setTxSign(signature);
      toast.success("Transaction Completed", {
        description: "Creating Task...",
        classNames: { toast: "toast-success" },
      });
      await onSubmit({
        ...data,
        transactionSignature: signature,
      });
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed", {
        description: "Please try again",
        classNames: { toast: "toast-error" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={
          txSign ? form.handleSubmit(onSubmit) : form.handleSubmit(onPayment)
        }
        className="w-full space-y-6"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Select the most clickable thumbnail"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter your amount"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the total amount of solana you want to assign for this
                task
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="files"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Files</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept={ALLOWED_FILE_TYPE.join(",")}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    field.onChange(files);
                  }}
                />
              </FormControl>
              <FormDescription>
                You can upload up to 5 files (jpg, png, pdf). Max 5MB each.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={loading} className="w-full" type="submit">
          {loading && <Loader className={"h-5 w-5"} />}
          {txSign ? "Create task" : `Pay`}
        </Button>
      </form>
    </Form>
  );
}
