'use client';
import React from 'react';
import {
  BrainCircuit,
  LayoutDashboard,
  PieChart,
  Menu,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AppHeader } from './header';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '#input' },
  { icon: BrainCircuit, label: 'Predictions', href: '#predictions' },
  { icon: PieChart, label: 'Distribution', href: '#trends' },
];

const NavContent = () => (
  <nav className="flex flex-col gap-2 px-4 py-6">
    {navItems.map((item) => (
      <Button
        key={item.label}
        variant="ghost"
        className="justify-start gap-3"
        asChild
      >
        <a href={item.href}>
          <item.icon className="h-5 w-5 text-muted-foreground" />
          <span>{item.label}</span>
        </a>
      </Button>
    ))}
  </nav>
);

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="hidden md:flex flex-col border-r bg-muted/40">
          <div className="flex h-16 items-center border-b px-6">
            <a href="/" className="flex items-center gap-2 font-headline font-semibold text-lg">
              <Image src="/favicon.ico" alt="FinalPrep AI" width={24} height={24} className="h-12 w-12" />
              <span>FinalPrep AI</span>
            </a>
          </div>
          <NavContent />
        </aside>
        <div className="flex flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-muted/40 px-4 md:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                   <SheetTitle className='flex items-center gap-2 font-headline font-semibold text-lg'>
                     <Image src="/favicon.ico" alt="FinalPrep AI" width={24} height={24} className="h-8 w-8" />
                     <span>FinalPrep AI</span>
                   </SheetTitle>
                </SheetHeader>
                <NavContent />
              </SheetContent>
            </Sheet>
            <AppHeader />
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
