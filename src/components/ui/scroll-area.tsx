import * as React from "react";
import { cn } from "./utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function ScrollArea({
  className,
  children,
  ...props
}: ScrollAreaProps) {
  return (
    <div
      data-slot="scroll-area"
      className={cn("relative overflow-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function ScrollBar({ className, orientation = "vertical", ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: "vertical" | "horizontal" }) {
  return (
    <div
      data-slot="scroll-bar"
      data-orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-px",
        orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-px",
        className
      )}
      {...props}
    >
      <div className="relative flex-1 rounded-full bg-border" />
    </div>
  );
}

export { ScrollArea, ScrollBar };
