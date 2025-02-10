import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center gap-2 font-bold justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        unstyled: "",
        solid: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-2 border-primary bg-white text-primary hover:bg-primary/10",
        ghost: "text-neutral-11 hover:text-primary-400",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-8 py-2 text-sm [&>svg]:w-4 [&>svg]:h-4",
        md: "h-11 px-12 py-3 text-base [&>svg]:w-5 [&>svg]:h-5",
        lg: "h-14 px-[60px] py-4 text-lg [&>svg]:w-6 [&>svg]:h-6",
        icon: "h-11 w-11 rounded-lg",
        none: "",
      },
      icon: {
        visible: "flex-row",
        none: "",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
      icon: "visible",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

// IconButton Component: A button intended solely for icons.
// It extends the ButtonProps but omits the "size" prop to ensure it remains the "icon" size.
export type IconButtonProps = Omit<ButtonProps, "size">;
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        // Apply the "icon" size by default
        className={cn(buttonVariants({ size: "icon" }), className)}
        {...props}
      />
    );
  },
);
IconButton.displayName = "IconButton";

export { Button, buttonVariants, IconButton };
