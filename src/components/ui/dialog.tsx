import * as React from "react";
import { XIcon } from "lucide-react";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog");
  }
  return context;
}

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function DialogTrigger({ children, asChild, onClick, ...props }: DialogTriggerProps) {
  const { onOpenChange } = useDialogContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onOpenChange(true);
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onClick: handleClick,
    });
  }

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  const { open } = useDialogContext();
  
  if (!open) return null;
  
  return <>{children}</>;
}

function DialogClose({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = useDialogContext();

  return (
    <button
      onClick={() => onOpenChange(false)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => {
    const { open } = useDialogContext();
    
    if (!open) return null;
    
    return (
      <div
        ref={ref}
        data-slot="dialog-overlay"
        className={`fixed inset-0 z-50 bg-black/50 animate-fade-in ${className}`}
        {...props}
      />
    );
  }
);
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => {
    const { open, onOpenChange } = useDialogContext();
    
    React.useEffect(() => {
      if (!open) return;
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onOpenChange(false);
        }
      };
      
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onOpenChange]);
    
    if (!open) return null;
    
    return (
      <>
        <DialogOverlay onClick={() => onOpenChange(false)} />
        <div
          ref={ref}
          data-slot="dialog-content"
          className={`bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg animate-scale-in ${className}`}
          {...props}
        >
          {children}
          <button
            onClick={() => onOpenChange(false)}
            className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
          >
            <XIcon className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </>
    );
  }
);
DialogContent.displayName = "DialogContent";

function DialogHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={`flex flex-col gap-2 text-center sm:text-left ${className}`}
      {...props}
    />
  );
}

function DialogFooter({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={`flex flex-col-reverse gap-2 sm:flex-row sm:justify-end ${className}`}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h2
      ref={ref}
      data-slot="dialog-title"
      className={`text-lg leading-none font-semibold ${className}`}
      {...props}
    />
  )
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <p
      ref={ref}
      data-slot="dialog-description"
      className={`text-muted-foreground text-sm ${className}`}
      {...props}
    />
  )
);
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
