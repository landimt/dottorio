import * as React from "react";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within a DropdownMenu");
  }
  return context;
}

interface DropdownMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function DropdownMenu({ open: controlledOpen, onOpenChange, children }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, asChild, onClick, ...props }, ref) => {
    const { open, onOpenChange } = useDropdownMenuContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onOpenChange(!open);
      onClick?.(e);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as any, {
        onClick: handleClick,
        ref,
      });
    }

    return (
      <button
        ref={ref}
        data-slot="dropdown-menu-trigger"
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  align?: "start" | "center" | "end";
}

function DropdownMenuContent({
  className = "",
  sideOffset = 4,
  align = "start",
  children,
  ...props
}: DropdownMenuContentProps) {
  const { open, onOpenChange } = useDropdownMenuContext();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
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
  }, [open, onOpenChange]);

  if (!open) return null;

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div
      ref={contentRef}
      data-slot="dropdown-menu-content"
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground p-1 shadow-md animate-scale-in ${alignClasses[align]} ${className}`}
      style={{ top: `calc(100% + ${sideOffset}px)` }}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="dropdown-menu-group" {...props}>
      {children}
    </div>
  );
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
  variant?: "default" | "destructive";
  asChild?: boolean;
}

function DropdownMenuItem({
  className = "",
  inset,
  variant = "default",
  onClick,
  asChild,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { onOpenChange } = useDropdownMenuContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    onOpenChange(false);
  };

  const variantClasses = {
    default: "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
    destructive: "text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20 focus:text-destructive hover:bg-destructive/10",
  };

  const itemClassName = `relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none disabled:pointer-events-none disabled:opacity-50 ${inset ? "pl-8" : ""} ${variantClasses[variant]} ${className}`;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: typeof handleClick; className?: string }>, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        (children.props as { onClick?: (e: React.MouseEvent<HTMLElement>) => void }).onClick?.(e);
        onOpenChange(false);
      },
      className: `${itemClassName} ${(children.props as { className?: string }).className || ""}`,
    });
  }

  return (
    <button
      data-slot="dropdown-menu-item"
      className={itemClassName}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

interface DropdownMenuCheckboxItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function DropdownMenuCheckboxItem({
  className = "",
  children,
  checked,
  onCheckedChange,
  onClick,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCheckedChange?.(!checked);
    onClick?.(e);
  };

  return (
    <button
      data-slot="dropdown-menu-checkbox-item"
      className={`relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none disabled:pointer-events-none disabled:opacity-50 focus:bg-accent focus:text-accent-foreground ${className}`}
      onClick={handleClick}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CheckIcon className="size-4" />}
      </span>
      {children}
    </button>
  );
}

function DropdownMenuRadioGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="dropdown-menu-radio-group" {...props}>
      {children}
    </div>
  );
}

interface DropdownMenuRadioItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  value: string;
  checked?: boolean;
  onSelect?: (value: string) => void;
}

function DropdownMenuRadioItem({
  className = "",
  children,
  value,
  checked,
  onSelect,
  onClick,
  ...props
}: DropdownMenuRadioItemProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onSelect?.(value);
    onClick?.(e);
  };

  return (
    <button
      data-slot="dropdown-menu-radio-item"
      className={`relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none disabled:pointer-events-none disabled:opacity-50 focus:bg-accent focus:text-accent-foreground ${className}`}
      onClick={handleClick}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CircleIcon className="size-2 fill-current" />}
      </span>
      {children}
    </button>
  );
}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

function DropdownMenuLabel({
  className = "",
  inset,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={`px-2 py-1.5 text-sm font-medium ${inset ? "pl-8" : ""} ${className}`}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={`bg-border -mx-1 my-1 h-px ${className}`}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={`text-muted-foreground ml-auto text-xs tracking-widest ${className}`}
      {...props}
    />
  );
}

function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface DropdownMenuSubTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
}

function DropdownMenuSubTrigger({
  className = "",
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <button
      data-slot="dropdown-menu-sub-trigger"
      className={`flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground ${inset ? "pl-8" : ""} ${className}`}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </button>
  );
}

function DropdownMenuSubContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dropdown-menu-sub-content"
      className={`z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground p-1 shadow-lg ${className}`}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
