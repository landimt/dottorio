import * as React from "react";

const buttonVariantsConfig = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
    outline: "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md gap-1.5 px-3",
    lg: "h-10 rounded-md px-6",
    icon: "size-9 rounded-md",
  },
};

const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

// Function to generate button class names (similar to cva)
function buttonVariants(options?: {
  variant?: keyof typeof buttonVariantsConfig.variant;
  size?: keyof typeof buttonVariantsConfig.size;
}) {
  const variant = options?.variant || "default";
  const size = options?.size || "default";

  const variantClasses = buttonVariantsConfig.variant[variant] || buttonVariantsConfig.variant.default;
  const sizeClasses = buttonVariantsConfig.size[size] || buttonVariantsConfig.size.default;

  return `${baseClasses} ${variantClasses} ${sizeClasses}`;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariantsConfig.variant;
  size?: keyof typeof buttonVariantsConfig.size;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const combinedClasses = `${buttonVariants({ variant, size })} ${className}`;

    if (asChild) {
      return <span className={combinedClasses} {...(props as any)} />;
    }

    return (
      <button
        data-slot="button"
        className={combinedClasses}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
