import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'TripNexus — India ka AI Travel Planner 🇮🇳',
  description: 'Rajasthan se Ladakh tak, Kerala se Goa tak — AI se banao apna perfect Indian trip!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '16px',
              background: '#fff',
              color: '#1f2937',
              boxShadow: '0 10px 40px rgba(124,58,237,0.12)',
              border: '1px solid #ede9fe',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
