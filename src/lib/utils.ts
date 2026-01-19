import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes Tailwind de forma inteligente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata data para exibição
 */
export function formatDate(date: Date | string, locale = "it-IT"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formata data relativa (há X dias, etc.)
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "ora";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m fa`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h fa`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}g fa`;

  return formatDate(d);
}

/**
 * Trunca texto com ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Gera slug a partir de string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Capitaliza primeira letra
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
