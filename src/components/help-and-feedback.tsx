"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy } from 'lucide-react';
import { Button } from './ui/button';

const TelegramIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>Telegram</title><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.17.91-.494 1.202-.82 1.23-.696.065-1.225-.46-1.9-1.088-1.055-.965-1.637-1.564-2.67-2.515-.7-.645-.24-.963.15-.658.985.765 1.745 1.561 2.42 2.127.34.288.635.136.709-.236.13-.646.777-4.113.823-4.475.025-.19-.058-.335-.25-.213-1.045.64-1.808 1.05-2.618 1.54-.76.45-.34.66.14.47.803-.31 3.2-1.94 3.32-2.05a.51.51 0 0 1 .533.14z"/></svg>;


export function HelpAndFeedback() {
  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <LifeBuoy className="text-accent" /> Contact Us
        </CardTitle>
        <CardDescription>
          Have questions, feedback, or facing an issue? We're here to help!
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          For the fastest response, please reach out to our support team on Telegram.
        </p>
        <Button 
          asChild 
          className="bg-sky-500 hover:bg-sky-600 text-white"
          onClick={() => window.open('https://t.me/your_telegram_support_channel', '_blank')}
        >
          <a href="https://t.me/your_telegram_support_channel" target="_blank" rel="noopener noreferrer">
            <TelegramIcon />
            Contact via Telegram
          </a>
        </Button>
        <p className="text-xs text-muted-foreground pt-4">
            Please make sure to replace 'your_telegram_support_channel' with your actual Telegram username or channel link.
        </p>
      </CardContent>
    </Card>
  );
}
