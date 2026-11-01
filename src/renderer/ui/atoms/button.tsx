import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/** Class variants for a button look (variant: default, secondary, outline, ghost, destructive; size: default, sm, lg, icon); use on non-button elements that must look like one. */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border bg-background hover:bg-muted",
        ghost: "hover:bg-muted",
        destructive: "bg-destructive text-primary-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

/** The app's button; use it instead of a raw `<button>` (variant: default, secondary, outline, ghost, destructive; size: default, sm, lg, icon). */
export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
