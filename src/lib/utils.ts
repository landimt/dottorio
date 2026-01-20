import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import DOMPurify from "dompurify";

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

/**
 * Sanitiza HTML para prevenir XSS
 * Usa DOMPurify para remover scripts maliciosos e atributos perigosos
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    // Durante SSR, retorna o HTML como está (será sanitizado no cliente)
    return html;
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "sub", "sup",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a", "span", "div",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "id"],
    ALLOW_DATA_ATTR: false,
  });
}
