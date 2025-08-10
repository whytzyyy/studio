"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Gift } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { firestore } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';

const XIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>;
const TelegramIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>Telegram</title><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.17.91-.494 1.202-.82 1.23-.696.065-1.225-.46-1.9-1.088-1.055-.965-1.637-1.564-2.67-2.515-.7-.645-.24-.963.15-.658.985.765 1.745 1.561 2.42 2.127.34.288.635.136.709-.236.13-.646.777-4.113.823-4.475.025-.19-.058-.335-.25-.213-1.045.64-1.808 1.05-2.618 1.54-.76.45-.34.66.14.47.803-.31 3.2-1.94 3.32-2.05a.51.51 0 0 1 .533.14z"/></svg>;
const DiscordIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>Discord</title><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.443.804-.63 1.29a18.156 18.156 0 0 0-3.483 0 17.132 17.132 0 0 0-.63-1.29.075.075 0 0 0-.078-.037A19.785 19.785 0 0 0 3.678 4.37a.077.077 0 0 0-.04.084C3.438 5.618 3.328 6.95 3.328 8.35v.214a13.33 13.33 0 0 0 1.631 6.341.077.077 0 0 0 .064.047c.465.132.94.248 1.42.348a.077.077 0 0 0 .087-.063c.254-.644.453-1.33.613-2.055a.076.076 0 0 0-.04-.084c-.43-.162-.837-.344-1.222-.544a.076.076 0 0 1-.023-.082c.023-.023.048-.046.07-.068.024-.024.049-.045.075-.066a.076.076 0 0 1 .078-.009c.61.289 1.23.535 1.854.74a10.042 10.042 0 0 0 2.148.435 9.942 9.942 0 0 0 2.148-.435c.624-.205 1.244-.45 1.854-.74a.076.076 0 0 1 .078.009c.026.02.05.042.075.066.022.022.047.045.07.068a.076.076 0 0 1-.024.082c-.385.2-.792.382-1.222.544a.076.076 0 0 0-.04.084c.16.725.36 1.41.612 2.055a.077.077 0 0 0 .087.063c.48.1.955.216 1.42.348a.077.077 0 0 0 .064-.047 13.33 13.33 0 0 0 1.63-6.34v-.214c0-1.4.11-2.733.314-4.032a.077.077 0 0 0-.04-.085zM8.02 15.33c-1.183 0-2.15-1.076-2.15-2.4s.967-2.4 2.15-2.4c1.182 0 2.149 1.076 2.149 2.4s-.967 2.4-2.15 2.4zm7.965 0c-1.183 0-2.15-1.076-2.15-2.4s.967-2.4 2.15-2.4c1.182 0 2.149 1.076 2.149 2.4s-.967 2.4-2.15 2.4z"/></svg>;

const iconMap: { [key: string]: React.ComponentType } = {
  Telegram: TelegramIcon,
  X: XIcon,
  Discord: DiscordIcon,
};

interface SocialTask {
  id: string;
  name: string;
  icon: string;
  reward: number;
  link: string;
  order: number;
}
const TOTAL_SUPPLY_CAP = 50000000;


export function SocialTasks() {
  const [tasksList, setTasksList] = useState<SocialTask[]>([]);
  const [isCapped, setIsCapped] = useState(false);
  const { userProfile, completeSocialTask } = useAuth();
  const { toast } = useToast();

   useEffect(() => {
    const statsDocRef = doc(firestore, 'community-stats', 'live');
    const unsubscribeStats = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if ((data.totalTamraClaimed || 0) >= TOTAL_SUPPLY_CAP) {
          setIsCapped(true);
        } else {
          setIsCapped(false);
        }
      }
    });

    const tasksCollectionRef = collection(firestore, 'social-tasks');
    const q = query(tasksCollectionRef, orderBy('order', 'asc'));

    const unsubscribeTasks = onSnapshot(q, (querySnapshot) => {
      const tasks: SocialTask[] = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as SocialTask);
      });
      setTasksList(tasks);
    }, (error) => {
        console.error("Error fetching social tasks: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load social tasks from the database.",
        });
    });

    return () => {
        unsubscribeStats();
        unsubscribeTasks();
    };
  }, [toast]);


  const handleCompleteTask = async (id: string, reward: number, link: string) => {
    try {
        window.open(link, '_blank');
        
        await completeSocialTask(id, reward);
        
        toast({
            title: "Task Complete!",
            description: `You've earned ${reward} TAMRA!`,
        });

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Oops!",
            description: error.message || "Failed to complete task. Please try again.",
        });
    }
  };

  const isTaskCompleted = (id: string) => {
    // Ensure userProfile and completedTasks exist before checking
    return userProfile?.completedTasks?.includes(id);
  };
  
  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent /> : null;
  }

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Gift />Social Tasks</CardTitle>
        <CardDescription>Complete tasks to earn extra TAMRA tokens. More tasks coming soon!</CardDescription>
         {isCapped && (
            <p className="text-sm text-destructive font-semibold pt-2">
              The total supply cap has been reached. Rewards for social tasks are disabled.
            </p>
          )}
      </CardHeader>
      <CardContent className="space-y-4">
        {tasksList.map((task) => (
          <div key={task.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-4">
            <div className="flex items-center gap-4">
              <div className="text-accent">{getIconComponent(task.icon)}</div>
              <div>
                <p className="font-semibold">{task.name}</p>
                <p className="text-sm text-copper-gradient">+{task.reward} TAMRA</p>
              </div>
            </div>
            {isTaskCompleted(task.id) ? (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
                <span>Completed</span>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => handleCompleteTask(task.id, task.reward, task.link)}
                disabled={isCapped}
              >
                Complete Task
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
