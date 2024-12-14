type Variant = "success" | "error" | "info";

export const toastVariant: Record<Variant, string> = {
  success:
    "group toast group-[.toaster]:bg-green-500 group-[.toaster]:text-neutral-50 group-[.toaster]:border-border-green-500 group-[.toaster]:shadow-lg",
  error:
    "group toast group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive group-[.toaster]:shadow-lg",
  info: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
};
