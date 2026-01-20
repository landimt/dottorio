import * as React from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled: boolean;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Select({ value: controlledValue, onValueChange, defaultValue = "", disabled = false, open: controlledOpen, onOpenChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [internalOpen, setInternalOpen] = React.useState(false);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen, disabled }}>
      <div className="relative inline-block w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

function SelectGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="select-group" {...props}>{children}</div>;
}

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

function SelectValue({ placeholder, children }: SelectValueProps) {
  const { value } = useSelectContext();
  
  // Se children for fornecido, renderiza children, senão usa value ou placeholder
  if (children) {
    return <span data-slot="select-value">{children}</span>;
  }
  
  return <span data-slot="select-value">{value || placeholder}</span>;
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "default";
}

function SelectTrigger({
  className = "",
  size = "default",
  children,
  ...props
}: SelectTriggerProps) {
  const { open, setOpen, disabled } = useSelectContext();
  
  const sizeClasses = {
    default: "h-10",
    sm: "h-8",
  };

  return (
    <button
      type="button"
      data-slot="select-trigger"
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
      className={`flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm whitespace-nowrap transition-all outline-none hover:border-primary/50 focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted disabled:hover:border-border ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
      <ChevronDownIcon className={`w-4 h-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function SelectContent({
  className = "",
  children,
  ...props
}: SelectContentProps) {
  const { open, setOpen } = useSelectContext();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      data-slot="select-content"
      className={`absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg animate-scale-in mt-1 max-h-60 overflow-y-auto ${className}`}
      {...props}
    >
      <div className="p-1.5">
        {children}
      </div>
    </div>
  );
}

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function SelectItem({
  className = "",
  children,
  value,
  onClick,
  ...props
}: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
  const isSelected = selectedValue === value;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onValueChange(value);
    setOpen(false);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      data-slot="select-item"
      className={`relative flex w-full cursor-pointer items-center rounded-md py-2 pl-8 pr-3 text-sm outline-none select-none transition-colors focus:bg-muted focus:text-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 ${className}`}
      onClick={handleClick}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <CheckIcon className="h-4 w-4 text-primary" />}
      </span>
      {children}
    </button>
  );
}

function SelectLabel({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-label"
      className={`py-1.5 pl-8 pr-2 text-sm font-semibold ${className}`}
      {...props}
    />
  );
}

function SelectSeparator({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-separator"
      className={`-mx-1 my-1 h-px bg-muted ${className}`}
      {...props}
    />
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
