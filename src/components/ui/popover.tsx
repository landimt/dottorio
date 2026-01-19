import * as React from "react";
import { cn } from "./utils";

interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within a Popover");
  }
  return context;
}

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

function Popover({ children, open: controlledOpen, onOpenChange, defaultOpen = false }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
  };

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div data-slot="popover" className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ onClick, ...props }, ref) => {
    const { onOpenChange, open } = usePopoverContext();
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onOpenChange(!open);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        data-slot="popover-trigger"
        type="button"
        aria-expanded={open}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

PopoverTrigger.displayName = "PopoverTrigger";

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
    const { open, onOpenChange } = usePopoverContext();
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          onOpenChange(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onOpenChange(false);
        }
      };

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
      <div
        ref={contentRef}
        data-slot="popover-content"
        data-align={align}
        className={cn(
          "absolute z-50 mt-2 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
          align === "start" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          align === "end" && "right-0",
          className
        )}
        style={{ top: `calc(100% + ${sideOffset}px)` }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
