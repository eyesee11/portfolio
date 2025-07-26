"use client";

import { useRef, useEffect, type FC } from "react";
import { cn } from "@/lib/utils";

interface VideoLogoProps {
  className?: string;
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export const VideoLogo: FC<VideoLogoProps> = ({ 
  className, 
  src, 
  autoPlay = true, 
  loop = true, 
  muted = true 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && autoPlay) {
      video.play().catch((error) => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, [autoPlay]);

  return (
    <video
      ref={videoRef}
      className={cn("object-contain", className)}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      preload="auto"
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};
