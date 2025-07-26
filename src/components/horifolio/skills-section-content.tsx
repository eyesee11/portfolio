
import type { FC } from "react";
import { Badge } from "@/components/ui/badge";

const skillsData = {
  "Languages/Tools": [
    "JavaScript", "TypeScript", "Python", "Java", "Git", "Docker", "MongoDB", "SQL", "NoSQL", "AWS"
  ],
  "Frameworks/Libraries": [
    "React", "Next.js", "Node.js", "Express", "Tailwind CSS", "Material-UI", "Django", "Flask", "FastAPI", "GraphQL"
  ],
  "Soft Skills": [
    "Problem Solving", "Team Collaboration", "Agile Development", "Leadership", "Communication", "Project Management", "Critical Thinking", "Adaptability", "Time Management", "Mentoring"
  ]
};

export const SkillsSectionContent: FC = () => (
  <>
    <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto text-center">
      Here are some of the technologies and skills I'm proficient in. I'm always excited to learn new things and expand my skillset.
    </p>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-0 relative">
      {Object.entries(skillsData).map(([category, skills], index) => (
        <div key={category} className="relative flex flex-col items-center">
          {/* Category Content */}
          <div className="w-full max-w-sm px-4">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              {category}
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {skills.map((skill) => (
                <Badge 
                  key={skill} 
                  variant="secondary" 
                  className="text-sm px-3 py-1 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Vertical Animated Separator - Only between columns */}
          {index < Object.entries(skillsData).length - 1 && (
            <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px">
              {/* Base line */}
              <div className="h-full w-px bg-gradient-to-b from-transparent via-blue-400/50 to-transparent"></div>
              
              {/* Center pulse */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
              </div>
              
              {/* Moving light effect */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent h-32 animate-bounce"></div>
              </div>
              
              {/* Top and bottom pulses */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-ping"></div>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-ping animation-delay-1000"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </>
);
