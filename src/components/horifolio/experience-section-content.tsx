
import type { FC } from "react";

interface ExperienceItemProps {
    role: string;
    company: string;
    period: string;
    description: string[];
  }
  
const ExperienceItem: FC<ExperienceItemProps> = ({ role, company, period, description }) => (
<div className="mb-8 last:mb-0">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
      <h4 className="font-bold text-xl text-primary">{role}</h4>
      <p className="text-sm text-foreground/60 mt-1 sm:mt-0">{period}</p>
    </div>
    <h5 className="font-semibold text-lg text-foreground/80 mb-3">{company}</h5>
    <ul className="text-foreground/70 space-y-2">
      {description.map((item, index) => (
        <li key={index} className="flex items-start">
          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
</div>
);

export const ExperienceSectionContent: FC = () => (
    <>
      <ExperienceItem
        role="Web Development Intern"
        company="OctaNet Services Pvt. Ltd."
        period="2024"
        description={[
          "Designed and deployed responsive websites using React.js, Bootstrap, and MongoDB.",
          "Managed CI/CD pipelines with GitLab and Docker.",
          "Ensured 100% deployment success with modification service included."
        ]}
      />
      <ExperienceItem
        role="Research and Development Intern"
        company="StudifySuccess Pvt. Ltd."
        period="2024"
        description={[
          "Conducted market and competitive analysis using Google Sheets and Power BI.",
          "Delivered data-driven presentations on AI technologies.",
          "Improved stakeholder decision-making by 15% and got awarded as \"Best intern of the month twice\"."
        ]}
      />
    </>
  );
