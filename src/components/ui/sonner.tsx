"use client";

import * as React from "react";
import { useState, useEffect } from "react";

interface Toast {
  id: string;
  message: string;
  type?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

interface ToasterProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  className?: string;
}

let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

export const toast = (message: string, options?: { type?: Toast['type']; duration?: number }) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = {
    id,
    message,
    type: options?.type || 'default',
    duration: options?.duration || 3000,
  };
  
  toasts = [...toasts, newToast];
  listeners.forEach(listener => listener(toasts));
  
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    listeners.forEach(listener => listener(toasts));
  }, newToast.duration);
};

toast.success = (message: string, duration?: number) => toast(message, { type: 'success', duration });
toast.error = (message: string, duration?: number) => toast(message, { type: 'error', duration });
toast.warning = (message: string, duration?: number) => toast(message, { type: 'warning', duration });

const Toaster = ({ position = 'bottom-right', className = '' }: ToasterProps) => {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts([...newToasts]);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  const typeStyles = {
    default: 'bg-card text-card-foreground border-border',
    success: 'bg-dottorei-success text-white border-dottorei-success',
    error: 'bg-dottorei-error text-white border-dottorei-error',
    warning: 'bg-dottorei-warning text-white border-dottorei-warning',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-[9999] pointer-events-none ${className}`}>
      <div className="flex flex-col gap-2 min-w-[300px] max-w-[500px]">
        {currentToasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-lg animate-slide-in-up ${
              typeStyles[toast.type || 'default']
            }`}
            style={{
              animation: 'slide-in-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Toaster };
