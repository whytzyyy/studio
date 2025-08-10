import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardNav } from '@/components/dashboard-nav';
import { Header } from '@/components/header';
import { BackgroundParticles } from '@/components/background-particles';
import { LogoAnimation } from '@/components/logo-animation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen w-full overflow-x-hidden bg-background font-body text-foreground">
        <BackgroundParticles />
        <Sidebar>
          <div className="flex flex-col h-full bg-background/95 backdrop-blur-sm">
            <SidebarHeader className="p-4">
              <LogoAnimation animated={false} />
            </SidebarHeader>
            <DashboardNav />
          </div>
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="relative z-10 p-4 sm:p-6 lg:p-8 pt-24">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
