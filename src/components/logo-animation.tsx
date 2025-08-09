"use client";

// Custom styles for the 3D tilt effect in a style tag to avoid purging
const tiltStyles = `
.logo-container:hover .logo-image-wrapper {
  transform: perspective(1000px) rotateX(10deg) rotateY(-10deg) scale3d(1.05, 1.05, 1.05);
  filter: drop-shadow(0 0 25px hsla(var(--accent-hsl), 0.6));
}
.logo-image-wrapper {
  transition: all 0.3s ease-out;
  animation: scale-in 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
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
`;

export function LogoAnimation() {
  return (
    <>
      <style>{tiltStyles}</style>
      <div className="logo-container group relative flex flex-col items-center justify-center">
        <div className="logo-image-wrapper h-48 w-48 md:h-56 md:w-56 rounded-full border-4 border-primary/20 flex items-center justify-center bg-background overflow-hidden">
          <img
            src="/logo.png"
            alt="Tamra Vault Logo"
            className="h-40 w-40 md:h-48 md:w-48 object-contain"
          />
        </div>
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
