import * as React from 'react';

export type ClassValue = string | number | boolean | undefined | null | ClassArray | ClassDictionary;
export type ClassDictionary = Record<string, any>;
export type ClassArray = ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) classes.push(key);
      }
    }
  }
  
  return classes.join(' ');
}

// Minimal cva implementation for class-variance-authority compatibility
export type VariantProps<T> = T extends (...args: any) => any
  ? Parameters<T>[0]
  : never;

export interface CVAConfig {
  variants?: Record<string, Record<string, string>>;
  defaultVariants?: Record<string, any>;
  compoundVariants?: Array<{
    [key: string]: any;
    class?: string;
    className?: string;
  }>;
}

export function cva(base: string, config?: CVAConfig) {
  return (props?: Record<string, any>) => {
    if (!config || !props) return base;

    const { variants, defaultVariants, compoundVariants } = config;
    let classes = [base];

    // Apply variant classes
    if (variants) {
      for (const [variantName, variantOptions] of Object.entries(variants)) {
        const value = props[variantName] ?? defaultVariants?.[variantName];
        if (value && variantOptions[value]) {
          classes.push(variantOptions[value]);
        }
      }
    }

    // Apply compound variants
    if (compoundVariants) {
      for (const compound of compoundVariants) {
        const { class: compoundClass, className: compoundClassName, ...conditions } = compound;
        const matches = Object.entries(conditions).every(
          ([key, value]) => props[key] === value || defaultVariants?.[key] === value
        );
        if (matches && (compoundClass || compoundClassName)) {
          classes.push(compoundClass || compoundClassName || '');
        }
      }
    }

    // Add className prop if provided
    if (props.className) {
      classes.push(props.className);
    }

    return cn(...classes);
  };
}

// Simple Slot implementation for @radix-ui/react-slot compatibility
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, forwardedRef) => {
    if (React.isValidElement(children)) {
      const childProps = children.props as Record<string, unknown>;
      return React.cloneElement(children, {
        ...props,
        ...childProps,
        ref: forwardedRef,
      } as React.Attributes);
    }

    if (React.Children.count(children) > 1) {
      React.Children.only(null);
    }

    return null;
  }
);

Slot.displayName = 'Slot';
