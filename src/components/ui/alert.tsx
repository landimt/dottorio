import * as React from "react";

const alertVariants = {
  default: "bg-card text-card-foreground",
  destructive: "text-destructive bg-card [&>svg]:text-current",
};

export type AlertVariant = keyof typeof alertVariants;

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

function Alert({
  className = "",
  variant = "default",
  ...props
}: AlertProps) {
  const variantClasses = alertVariants[variant] || alertVariants.default;
  
  return (
    <div
      data-slot="alert"
      role="alert"
      className={`relative w-full rounded-lg border px-4 py-3 text-sm ${variantClasses} ${className}`}
      {...props}
    />
  );
}

function AlertTitle({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-title"
      className={`font-medium tracking-tight ${className}`}
      {...props}
    />
  );
}

function AlertDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-description"
      className={`text-muted-foreground text-sm [&_p]:leading-relaxed ${className}`}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
