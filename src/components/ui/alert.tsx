import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success";
}

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border px-4 py-3 text-sm",
        variant === "destructive" &&
          "border-destructive/50 text-destructive dark:border-destructive",
        variant === "success" && "border-green-500/50 text-green-700 dark:text-green-400",
        variant === "default" && "border-border bg-muted/50",
        className,
      )}
      {...props}
    />
  );
}
