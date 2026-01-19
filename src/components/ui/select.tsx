import * as React from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
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
  children: React.ReactNode;
}

function Select({ value: controlledValue, onValueChange, defaultValue = "", children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
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
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelectContext();
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
  const { open, setOpen } = useSelectContext();
  
  const sizeClasses = {
    default: "h-9",
    sm: "h-8",
  };

  return (
    <button
      type="button"
      data-slot="select-trigger"
      onClick={() => setOpen(!open)}
      className={`flex w-full items-center justify-between gap-2 rounded-md border border-input bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
      <ChevronDownIcon className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
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
      className={`absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-scale-in mt-1 max-h-60 overflow-y-auto ${className}`}
      {...props}
    >
      <div className="p-1">
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
      className={`relative flex w-full cursor-default items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none select-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 ${className}`}
      onClick={handleClick}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <CheckIcon className="h-4 w-4" />}
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
