"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { FC } from "react";

interface AnimatedLogoProps {
  className?: string;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const AnimatedLogo: FC<AnimatedLogoProps> = ({ 
  className, 
  src, 
  alt = "Logo",
  width = 56,
  height = 56,
  priority = false
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-contain", className)}
      unoptimized // Important for GIFs to preserve animation
      priority={priority}
    />
  );
};
