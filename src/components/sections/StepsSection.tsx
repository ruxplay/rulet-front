'use client';

import { StepCard } from './StepCard';

export const StepsSection = () => {
  const steps = [
    {
      number: 1,
      title: "REGÍSTRATE",
      description: "Si todavía no eres usuario, abre tu cuenta, es gratis y solo toma unos segundos",
      delay: 0
    },
    {
      number: 2,
      title: "APUESTA",
      description: "Realiza tu apuesta en nuestra increíble oferta de eventos y mercados",
      delay: 2
    },
    {
      number: 3,
      title: "GANA",
      description: "Recibe bonos extras por tus ganancias con nuestras increíbles promociones",
      delay: 4
    }
  ];

  return (
    <section className="steps-section">
      <div className="steps-container">
        {steps.map((step) => (
          <StepCard
            key={step.number}
            number={step.number}
            title={step.title}
            description={step.description}
            delay={step.delay}
          />
        ))}
      </div>
    </section>
  );
};
