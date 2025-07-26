import type { FC } from "react";
import Image from "next/image";
import { Github, ExternalLink } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  githubUrl: string;
  liveUrl: string;
  technologies?: string[];
}

const ProjectCard: FC<ProjectCardProps> = ({ title, description, image, githubUrl, liveUrl, technologies }) => (
  <div className="bg-background/50 p-4 rounded-lg border border-border flex flex-col group hover:bg-background/70 transition-all duration-300">
    <div className="relative overflow-hidden rounded-md mb-4">
      <Image 
        src={image} 
        alt={title} 
        width={600} 
        height={400} 
        className="w-full h-40 object-cover rounded-md group-hover:scale-105 transition-transform duration-300" 
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
    </div>
    
    <h4 className="font-bold text-lg text-primary mb-2">{title}</h4>
    <p className="text-sm text-foreground/70 mb-4 flex-grow">{description}</p>
    
    {technologies && (
      <div className="flex flex-wrap gap-2 mb-4">
        {technologies.map((tech) => (
          <span key={tech} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
            {tech}
          </span>
        ))}
      </div>
    )}
    
    <div className="flex gap-4 mt-auto justify-end">
      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors duration-200 hover:scale-110 transform"
        title="View Source Code"
      >
        <Github size={20} />
      </a>
      <a
        href={liveUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 hover:scale-110 transform"
        title="View Live Demo"
      >
        <ExternalLink size={20} />
      </a>
    </div>
  </div>
);

export const ProjectsSectionContent: FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pr-2">
    <ProjectCard
      title="Portfolio Website"
      description="A modern, responsive portfolio website built with Next.js and Tailwind CSS featuring dynamic sections and smooth animations."
      image="https://placehold.co/600x400.png"
      githubUrl="https://github.com/yourusername/portfolio"
      liveUrl="https://your-portfolio.vercel.app"
      technologies={["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"]}
    />
    <ProjectCard
      title="E-Commerce Platform"
      description="Full-stack e-commerce application with user authentication, payment integration, and admin dashboard."
      image="https://placehold.co/600x400.png"
      githubUrl="https://github.com/yourusername/ecommerce"
      liveUrl="https://ecommerce-demo.vercel.app"
      technologies={["React", "Node.js", "MongoDB", "Stripe API"]}
    />
    <ProjectCard
      title="Task Management App"
      description="A collaborative task management application with real-time updates and team collaboration features."
      image="https://placehold.co/600x400.png"
      githubUrl="https://github.com/yourusername/task-manager"
      liveUrl="https://task-manager-demo.netlify.app"
      technologies={["React", "Firebase", "Material-UI", "Socket.io"]}
    />
    <ProjectCard
      title="Weather Dashboard"
      description="Interactive weather dashboard with data visualization and location-based forecasts using weather APIs."
      image="https://placehold.co/600x400.png"
      githubUrl="https://github.com/yourusername/weather-dashboard"
      liveUrl="https://weather-dashboard-demo.vercel.app"
      technologies={["Vue.js", "Chart.js", "OpenWeather API", "CSS3"]}
    />
  </div>
);
