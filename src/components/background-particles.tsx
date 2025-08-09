"use client";

import { useEffect, useState } from 'react';

export function BackgroundParticles() {
  const [particles, setParticles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      if (typeof window === 'undefined') return;
      const particleArray = [];
      const numParticles = 20;
      for (let i = 0; i < numParticles; i++) {
        const size = Math.random() * 5 + 2;
        const style = {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 25}s`,
          animationDuration: `${Math.random() * 15 + 20}s`,
        };
        particleArray.push(<div key={i} className="particle animate-float" style={style} />);
      }
      setParticles(particleArray);
    };

    generateParticles();
  }, []);

  return <div className="particles absolute top-0 left-0 w-full h-full overflow-hidden z-0">{particles}</div>;
}
