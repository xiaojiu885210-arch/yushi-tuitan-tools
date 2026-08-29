import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        muted: "bg-muted text-muted-foreground",
        outline: "border border-border text-foreground",
        ok: "bg-ok/10 text-ok",
        warn: "bg-warn/10 text-warn",
      },
    },
    defaultVariants: { variant: "muted" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
