import * as React from "react";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs");
  }
  return context;
}

interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  className?: string;
  children: React.ReactNode;
}

function Tabs({
  value: controlledValue,
  onValueChange,
  defaultValue = "",
  className = "",
  children,
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div data-slot="tabs" className={`flex flex-col gap-2 ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

function TabsList({
  className = "",
  ...props
}: TabsListProps) {
  return (
    <div
      data-slot="tabs-list"
      className={`bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] ${className}`}
      {...props}
    />
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabsTrigger({
  className = "",
  value,
  children,
  onClick,
  ...props
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isSelected = selectedValue === value;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onValueChange(value);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      data-state={isSelected ? "active" : "inactive"}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({
  className = "",
  value,
  children,
  ...props
}: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  
  if (selectedValue !== value) return null;

  return (
    <div
      data-slot="tabs-content"
      data-state={selectedValue === value ? "active" : "inactive"}
      className={`mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
