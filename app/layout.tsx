import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { AppProvider } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ERP Rendszer',
  description: 'Vállalati ERP rendszer – CRM, számlázás, készlet, HR',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AppProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center justify-end px-6 py-3 border-b border-border bg-background">
                  <ThemeToggle />
                </header>
                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
              </div>
            </div>
            <Toaster richColors position="top-right" />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
