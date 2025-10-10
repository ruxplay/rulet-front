'use client';

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  delay: number;
}

export const StepCard = ({ number, title, description, delay }: StepCardProps) => {
  return (
    <div className="step-card">
      <div 
        className="step-number" 
        style={{ animationDelay: `${delay}s` }}
      >
        {number}
      </div>
      <h4 className="step-title">{title}</h4>
      <p className="step-description">{description}</p>
    </div>
  );
};
