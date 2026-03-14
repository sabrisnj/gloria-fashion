import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AccessibilityMenu } from './AccessibilityMenu';
import { Client } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  client: Client | null;
  isAdmin: boolean;
  onLogout: () => void;
  accessibility: any;
  setAccessibility: (a: any) => void;
}

export function Layout({ children, client, isAdmin, onLogout, accessibility, setAccessibility }: LayoutProps) {
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar isAdmin={isAdmin} />
      
      <main className="flex-grow container mx-auto px-4 py-6 pb-24 max-w-md">
        {children}
      </main>

      <Footer />

      <AccessibilityMenu 
        isOpen={isAccessibilityOpen} 
        onClose={() => setIsAccessibilityOpen(false)} 
        accessibility={accessibility}
        setAccessibility={setAccessibility}
      />
    </div>
  );
}
