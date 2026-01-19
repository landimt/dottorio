import * as React from "react";

const badgeVariants = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-destructive text-white",
  outline: "text-foreground",
};

export type BadgeVariant = keyof typeof badgeVariants;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  const variantClasses = badgeVariants[variant] || badgeVariants.default;
  
  return (
    <span
      data-slot="badge"
      className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-colors ${variantClasses} ${className}`}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
