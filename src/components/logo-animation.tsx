"use client";

import { cn } from "@/lib/utils";

// Custom styles for the 3D tilt effect in a style tag to avoid purging
const tiltStyles = `
.logo-container:hover .logo-image-wrapper {
  transform: perspective(1000px) rotateX(10deg) rotateY(-10deg) scale3d(1.05, 1.05, 1.05);
  filter: drop-shadow(0 0 25px hsla(var(--accent-hsl), 0.6));
}
.logo-image-wrapper {
  transition: all 0.3s ease-out;
}
`;

export function LogoAnimation({ animated = true }: { animated?: boolean }) {
  return (
    <>
      <style>{tiltStyles}</style>
      <div className="logo-container group relative flex flex-col items-center justify-center">
        <div className={cn("animate-in fade-in-0 slide-in-from-bottom-10 duration-1000")}>
            <img
            src="/logo.png"
            alt="Tamra Vault Logo"
            className={cn(
                "logo-image-wrapper h-32 w-32 md:h-40 md:w-40 object-contain",
                animated && "animate-float-up"
            )}
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
