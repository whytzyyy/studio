"use client";

// Custom styles for the 3D tilt effect in a style tag to avoid purging
const tiltStyles = `
.logo-container:hover .logo-svg {
  transform: perspective(1000px) rotateX(10deg) rotateY(-10deg) scale3d(1.05, 1.05, 1.05);
  filter: drop-shadow(0 0 15px hsla(28, 54%, 61%, 0.8));
}
.logo-svg {
  transition: all 0.3s ease-out;
  animation: scale-in 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
.gradient-stop-1 {
  animation: sweep-1 2s ease-in-out 0.5s forwards;
}
.gradient-stop-2 {
    animation: sweep-2 2s ease-in-out 0.5s forwards;
}
@keyframes scale-in {
    from {
        transform: scale(0.5);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}
@keyframes sweep-1 {
  from {
    stop-color: #E6A978;
  }
  to {
    stop-color: #C17A46;
  }
}
@keyframes sweep-2 {
  from {
    stop-color: #C17A46;
  }
  to {
    stop-color: #E6A978;
  }
}
`;

export function LogoAnimation() {
  return (
    <>
      <style>{tiltStyles}</style>
      <div className="logo-container group relative flex flex-col items-center justify-center">
        <svg
          className="logo-svg h-32 w-32 md:h-40 md:w-40"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="copperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="gradient-stop-1" />
              <stop offset="100%" className="gradient-stop-2" />
            </linearGradient>
          </defs>
          <path
            fill="url(#copperGradient)"
            d="M50,5 L95,27.5 L95,72.5 L50,95 L5,72.5 L5,27.5 Z M50,15 L85,32.5 L85,67.5 L50,85 L15,67.5 L15,32.5 Z M50,25 L75,40 L75,60 L50,75 L25,60 L25,40 Z"
          />
        </svg>
        <div className="text-center animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-500">
            <h1 className="mt-4 font-headline text-4xl font-bold tracking-wider text-white md:text-5xl">
            TAMRA
            </h1>
            <p className="font-headline text-lg tracking-[0.4em] text-muted-foreground">VAULT</p>
        </div>
      </div>
    </>
  );
}
