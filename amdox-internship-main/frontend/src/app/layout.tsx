import './globals.css';
import PwaWrapper from '@/components/PwaWrapper';
import { Providers } from '@/components/Providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Amdox ERP — Enterprise AI-Powered Cloud Suite',
    template: '%s | Amdox ERP',
  },
  description: 'Production-grade, AI-powered, multi-tenant cloud ERP. Finance, HR, Supply Chain, Projects & BI in one platform.',
  keywords: ['ERP', 'Finance', 'HR', 'Supply Chain', 'AI Forecasting', 'Business Intelligence'],
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-mono)', height: '100vh', overflow: 'hidden' }}>
        <Providers>
          <PwaWrapper>
            {children}
          </PwaWrapper>
        </Providers>
      </body>
    </html>
  );
}
