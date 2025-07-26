
"use client";

import { useState, useRef, useEffect, type FC } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { HoriFolioSection } from "@/components/horifolio/horifolio-section";
import { AboutSectionContent } from "@/components/horifolio/about-section-content";
import { ProjectsSectionContent } from "@/components/horifolio/projects-section-content";
import { ContactSectionContent } from "@/components/horifolio/contact-section-content";
import { SkillsSectionContent } from "@/components/horifolio/skills-section-content";
import { ExperienceSectionContent } from "@/components/horifolio/experience-section-content";
import { ResumeSectionContent } from "@/components/horifolio/resume-section-content";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { Stars } from "@/components/ui/stars";

interface SectionData {
  id: number;
  title: string;
  component: FC;
}

const sections: SectionData[] = [
  { id: 0, title: "About", component: AboutSectionContent },
  { id: 1, title: "Skills", component: SkillsSectionContent },
  { id: 2, title: "Projects", component: ProjectsSectionContent },
  { id: 3, title: "Experience", component: ExperienceSectionContent },
  { id: 4, title: "Resume", component: ResumeSectionContent },
  { id: 5, title: "Contact", component: ContactSectionContent },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRequestRef = useRef<number | null>(null);
  const scrollDirectionRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX } = e;
      const { innerWidth } = window;
      const scrollZone = 150;

      if (clientX < scrollZone) {
        scrollDirectionRef.current = -1;
      } else if (clientX > innerWidth - scrollZone) {
        scrollDirectionRef.current = 1;
      } else {
        scrollDirectionRef.current = 0;
      }
    };
    
    const animateScroll = () => {
        if (scrollDirectionRef.current !== 0) {
            container.scrollBy({ left: scrollDirectionRef.current * 5, behavior: 'auto' });
        }
        scrollRequestRef.current = requestAnimationFrame(animateScroll);
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollBy({ left: e.deltaY, behavior: 'smooth' });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("wheel", handleWheel, { passive: false });
    scrollRequestRef.current = requestAnimationFrame(animateScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("wheel", handleWheel);
      if(scrollRequestRef.current) {
        cancelAnimationFrame(scrollRequestRef.current);
      }
    };
  }, []);


  return (
    <main className="h-screen w-screen bg-transparent font-body relative flex items-center overflow-hidden z-10">
      <Stars />
      <div className="absolute top-0 left-0 right-0 p-8 sm:p-12 z-20 bg-gradient-to-b from-black/20 to-transparent backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 pointer-events-none">
            <AnimatedLogo 
              src="/A.gif" 
              className="h-14 w-auto rounded-lg shadow-lg" 
              alt="Portfolio Logo"
              width={56}
              height={56}
              priority={true}
            />
             <p className="text-white/90 mt-1 hidden sm:block font-semibold">AYUSH CHAUHAN</p>
          </div>
          <div className="flex items-center gap-4 pointer-events-auto">
        
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex items-center w-full h-full space-x-8 px-8 sm:px-16 overflow-x-auto overflow-y-hidden pt-24 relative z-10"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <motion.div
          className="flex-shrink-0 h-[calc(85vh-6rem)] w-[20vw] rounded-xl overflow-hidden relative bg-black/40 backdrop-blur-md border border-white/20 shadow-2xl"
          data-ai-hint="profile picture"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Image
            src="/pfp.png"
            alt="Profile Picture"
            width={400}
            height={600}
            className="w-full h-full object-cover"
            priority
          />
        </motion.div>

        {sections.map((section, index) => {
          const SectionComponent = section.component;
          return (
            <HoriFolioSection
              key={section.id}
              title={section.title}
              isActive={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
              isDynamicSize={section.title === "About"} // Enable dynamic sizing for About section
            >
              <SectionComponent />
            </HoriFolioSection>
          );
        })}
      </div>
       <div className="absolute bottom-8 right-8 sm:right-16 text-white/70 text-xs sm:text-sm z-20 pointer-events-none">
        Hover mouse near edges to scroll pretty please!!
      </div>
    </main>
  );
}
