import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export function NftBadge() {
  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2"><ShieldCheck className="text-accent" /> Early Supporter NFT</CardTitle>
        <CardDescription>A special badge of honor for our pre-listing participants.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center space-y-4 text-center">
        <div className="relative w-48 h-48 group">
            <Image 
                src="https://placehold.co/300x300.png" 
                alt="Early Supporter NFT Badge" 
                width={300} 
                height={300} 
                data-ai-hint="copper badge"
                className="rounded-full border-4 border-primary object-cover transition-transform duration-300 group-hover:scale-105" 
            />
        </div>
        <p className="font-semibold text-lg">You've claimed your badge!</p>
        <p className="text-sm text-muted-foreground max-w-xs">This free NFT recognizes you as a true pioneer of the Tamra ecosystem. Thank you for your support!</p>
      </CardContent>
    </Card>
  );
}
