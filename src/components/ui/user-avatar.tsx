"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Cores de gradiente bonitas para avatares
const avatarGradients = [
  "from-rose-400 to-orange-300",
  "from-violet-400 to-purple-300",
  "from-blue-400 to-cyan-300",
  "from-emerald-400 to-teal-300",
  "from-amber-400 to-yellow-300",
  "from-pink-400 to-rose-300",
  "from-indigo-400 to-blue-300",
  "from-fuchsia-400 to-pink-300",
  "from-teal-400 to-emerald-300",
  "from-orange-400 to-amber-300",
];

// Gera um índice consistente baseado no nome
function getGradientIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % avatarGradients.length;
}

// Gera iniciais do nome
function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
  "2xl": "h-20 w-20 text-2xl",
};

export function UserAvatar({ name, image, size = "md", className }: UserAvatarProps) {
  const initials = getInitials(name);
  const gradientIndex = getGradientIndex(name || "default");
  const gradient = avatarGradients[gradientIndex];

  return (
    <Avatar className={cn(sizeClasses[size], "ring-2 ring-border", className)}>
      {image && (
        <AvatarImage
          src={image}
          alt={name || "User"}
          className="object-cover"
        />
      )}
      <AvatarFallback
        className={cn(
          "bg-gradient-to-br font-semibold text-white",
          gradient
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
