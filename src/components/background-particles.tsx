"use client";

import { useEffect, useState } from 'react';

export function BackgroundParticles() {
  const [particles, setParticles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      if (typeof window === 'undefined') return;
      const particleArray = [];
      const numParticles = 50; // Increased from 20 to 50
      for (let i = 0; i < numParticles; i++) {
        const size = Math.random() * 7 + 3; // Increased size variation
        const style = {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 25}s`,
          animationDuration: `${Math.random() * 20 + 25}s`, // Varied duration
        };
        particleArray.push(<div key={i} className="particle animate-float" style={style} />);
      }
      setParticles(particleArray);
    };

    generateParticles();
  }, []);

  return (
    <div className="particles absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      <div className="background-glow w-[150vmax] h-[150vmax]"></div>
      {particles}
    </div>
  );
}
