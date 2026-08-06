import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Investment Portfolio Tracker & Rebalancing Dashboard',
  description: 'Live Portfolio Dashboard connected directly to Google Sheet Single Source of Truth',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
