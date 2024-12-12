import { cn } from "@/lib/utils";
import React from "react";

export default function Loader({ className }: { className: string | null }) {
  return (
    <div
      className={cn(
        "inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]",
        "motion-reduce:animate-[spin_1.5s_linear_infinite]",
        className
      )}
      role="status"
    ></div>
  );
}
