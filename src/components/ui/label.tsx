import * as React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

function Label({
  className = "",
  ...props
}: LabelProps) {
  return (
    <label
      data-slot="label"
      className={`flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export { Label };
