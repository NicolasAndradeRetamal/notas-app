import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { plexMono, plexSans, plexSerif } from './fonts';
import './globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { ThemeScript } from '@/components/layout/theme-script';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: {
    default: 'notas — tus notas en markdown, siempre encontrables',
    template: '%s · notas',
  },
  description:
    'Escribe en markdown, organiza en cuadernos y etiquetas, y encuentra cualquier nota al instante.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf7f2' },
    { media: '(prefers-color-scheme: dark)', color: '#141312' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${plexSans.variable} ${plexSerif.variable} ${plexMono.variable} antialiased`}>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
