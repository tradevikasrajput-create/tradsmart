import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuantTrade Pro | F&O Intraday AI',
  description: 'Professional F&O Intraday Trading SaaS Platform with AI Signals',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-50 min-h-screen font-sans antialiased selection:bg-blue-500/30" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
