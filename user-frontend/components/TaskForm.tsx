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
    .min(1, "Please upload at least one file")
    .max(5, "You can upload a maximum of 5 files"),
});

export function TaskForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      amount: 0,
      files: [],
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
