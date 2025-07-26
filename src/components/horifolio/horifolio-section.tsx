"use client";

import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface HoriFolioSectionProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
  isDynamicSize?: boolean; // New prop for About section
}

export const HoriFolioSection: FC<HoriFolioSectionProps> = ({
  title,
  isActive,
  onClick,
  children,
  isDynamicSize = false,
}) => {
  // Calculate dynamic width for About section when active
  const getActiveWidth = () => {
    if (!isDynamicSize) return "w-[60vw]";
    // For About section, use adequate width for text content
    return "w-[55vw]";
  };

  // Calculate dynamic height for About section when active
  const getActiveHeight = () => {
    if (!isDynamicSize) return "h-[calc(85vh-6rem)]";
    // For About section, use content-fitted height (removes empty space but shows full content)
    return isActive ? "min-h-[300px] h-fit" : "h-[calc(85vh-6rem)]";
  };

  return (
    <div
      className={cn(
        "flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-700 ease-in-out relative group",
        "bg-black/40 backdrop-blur-md shadow-2xl border border-white/20",
        getActiveHeight(),
        isActive ? getActiveWidth() : "w-[20vw] hover:w-[22vw] opacity-70 hover:opacity-100"
      )}
      onClick={onClick}
    >
      <Card className="w-full h-full bg-transparent border-none">
        <div className="relative h-full w-full">
          <div
            className={cn(
              'absolute transition-all duration-700 ease-in-out',
              isActive
                ? isDynamicSize 
                  ? 'top-4 left-4 opacity-100' // Closer to corner for dynamic sections
                  : 'top-6 left-6 opacity-100' // Normal position for other sections
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 opacity-70 group-hover:opacity-100'
            )}
          >
            <h2 className={cn('font-bold text-white whitespace-nowrap', isActive ? 'text-5xl' : 'text-4xl')}>
              {title}
            </h2>
          </div>

          <div
            className={cn(
              'absolute transition-opacity duration-500 ease-in-out overflow-y-auto',
              'scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent',
              isDynamicSize && isActive 
                ? 'top-20 left-4 right-4 pb-4' // Reduced spacing and closer to edges for dynamic sections
                : 'inset-0 top-28 left-6 right-6 bottom-6',
              isActive ? 'opacity-100 delay-300' : 'opacity-0 invisible'
            )}
          >
            {children}
          </div>
        </div>
      </Card>
    </div>
  );
};
