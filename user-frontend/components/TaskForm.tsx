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

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const optionArray: OptionType[] = [];

      console.log("Starting file uploads:", data.files.length, "files");

      await Promise.all(
        data.files.map(async (file, index) => {
          console.log(`Processing file ${index + 1}:`, file.name);

          const signedUrl = await axios.get(
            `${BACKEND_URL}/api/user/signedurl?filetype=${
              file.name.split(".")[1]
            }`,
            {
              headers: {
                Authorization:
                  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.XscY2TKsALxQ9-SGZfoQsqqsRrylaaabTxjf3wKEVs8",
              },
            }
          );
          console.log(
            `Got signed URL for file ${index + 1}:`,
            signedUrl.data.fileName
          );

          await axios.put(signedUrl.data.url, file, {
            headers: {
              "Content-Type": file.type,
            },
          });
          console.log(`Uploaded file ${index + 1} to S3`);

          optionArray.push({
            imageUrl: `${CDN_URL}/${signedUrl.data.fileName}`,
          });
          console.log(
            `Added file ${index + 1} to optionArray:`,
            optionArray[optionArray.length - 1]
          );
        })
      );

      console.log("All files processed. optionArray:", optionArray);

      const res = await axios.post(
        `${BACKEND_URL}/api/user/task`,
        {
          title: data.title,
          transactionSignature: "1234",
          options: optionArray,
        },
        {
          headers: {
            Authorization:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.XscY2TKsALxQ9-SGZfoQsqqsRrylaaabTxjf3wKEVs8",
          },
        }
      );
      console.log("Task created:", res.data);
    } catch (error) {
      console.error("Error in onSubmit:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
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
        <Button className="w-full" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
