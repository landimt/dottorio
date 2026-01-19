import * as React from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

function Avatar({
  className = "",
  ...props
}: AvatarProps) {
  return (
    <div
      data-slot="avatar"
      className={`relative flex size-10 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    />
  );
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

function AvatarImage({
  className = "",
  ...props
}: AvatarImageProps) {
  return (
    <img
      data-slot="avatar-image"
      className={`aspect-square size-full object-cover ${className}`}
      {...props}
    />
  );
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

function AvatarFallback({
  className = "",
  ...props
}: AvatarFallbackProps) {
  return (
    <div
      data-slot="avatar-fallback"
      className={`bg-muted flex size-full items-center justify-center rounded-full ${className}`}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
