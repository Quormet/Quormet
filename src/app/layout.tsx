/**
 * The root layout of the application, defining the global font, metadata, and 
 * rendering the Toaster component for notification support.
 */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Quormet — Democratic Community Management',
  description: 'Quormet empowers communities with tools for transparent governance, real-time voting, and seamless communication. Built for HOAs, apartment buildings, and community groups of all kinds.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
