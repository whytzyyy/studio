"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Gift } from 'lucide-react';

const XIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>;
const TelegramIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>Telegram</title><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.17.91-.494 1.202-.82 1.23-.696.065-1.225-.46-1.9-1.088-1.055-.965-1.637-1.564-2.67-2.515-.7-.645-.24-.963.15-.658.985.765 1.745 1.561 2.42 2.127.34.288.635.136.709-.236.13-.646.777-4.113.823-4.475.025-.19-.058-.335-.25-.213-1.045.64-1.808 1.05-2.618 1.54-.76.45-.34.66.14.47.803-.31 3.2-1.94 3.32-2.05a.51.51 0 0 1 .533.14z"/></svg>;
const DiscordIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>Discord</title><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.443.804-.63 1.29a18.156 18.156 0 0 0-3.483 0 17.132 17.132 0 0 0-.63-1.29.075.075 0 0 0-.078-.037A19.785 19.785 0 0 0 3.678 4.37a.077.077 0 0 0-.04.084C3.438 5.618 3.328 6.95 3.328 8.35v.214a13.33 13.33 0 0 0 1.631 6.341.077.077 0 0 0 .064.047c.465.132.94.248 1.42.348a.077.077 0 0 0 .087-.063c.254-.644.453-1.33.613-2.055a.076.076 0 0 0-.04-.084c-.43-.162-.837-.344-1.222-.544a.076.076 0 0 1-.023-.082c.023-.023.048-.046.07-.068.024-.024.049-.045.075-.066a.076.076 0 0 1 .078-.009c.61.289 1.23.535 1.854.74a10.042 10.042 0 0 0 2.148.435 9.942 9.942 0 0 0 2.148-.435c.624-.205 1.244-.45 1.854-.74a.076.076 0 0 1 .078.009c.026.02.05.042.075.066.022.022.047.045.07.068a.076.076 0 0 1-.024.082c-.385.2-.792.382-1.222.544a.076.076 0 0 0-.04.084c.16.725.36 1.41.612 2.055a.077.077 0 0 0 .087.063c.48.1.955.216 1.42.348a.077.077 0 0 0 .064-.047 13.33 13.33 0 0 0 1.63-6.34v-.214c0-1.4.11-2.733.314-4.032a.077.077 0 0 0-.04-.085zM8.02 15.33c-1.183 0-2.15-1.076-2.15-2.4s.967-2.4 2.15-2.4c1.182 0 2.149 1.076 2.149 2.4s-.967 2.4-2.15 2.4zm7.965 0c-1.183 0-2.15-1.076-2.15-2.4s.967-2.4 2.15-2.4c1.182 0 2.149 1.076 2.149 2.4s-.967 2.4-2.15 2.4z"/></svg>;


const initialTasks = [
  { id: 1, name: 'Join Telegram', icon: <TelegramIcon />, reward: 50, link: '#', completed: false },
  { id: 2, name: 'Follow on X', icon: <XIcon />, reward: 50, link: '#', completed: false },
  { id: 3, name: 'Retweet Post', icon: <XIcon />, reward: 50, link: '#', completed: false },
  { id: 4, name: 'Join Discord', icon: <DiscordIcon />, reward: 50, link: '#', completed: false },
];

export function SocialTasks() {
  const [tasks, setTasks] = useState(initialTasks);

  const completeTask = (id: number) => {
    // In a real app, you'd verify this action
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: true } : task));
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Gift />Social Tasks</CardTitle>
        <CardDescription>Complete tasks to earn extra TAMRA tokens. More tasks coming soon!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-4">
            <div className="flex items-center gap-4">
              <div className="text-accent">{task.icon}</div>
              <div>
                <p className="font-semibold">{task.name}</p>
                <p className="text-sm text-copper-gradient">+{task.reward} TAMRA</p>
              </div>
            </div>
            {task.completed ? (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
                <span>Completed</span>
              </div>
            ) : (
              <Button asChild variant="outline">
                <a href={task.link} target="_blank" rel="noopener noreferrer" onClick={() => setTimeout(() => completeTask(task.id), 2000)}>
                  Complete Task
                </a>
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
