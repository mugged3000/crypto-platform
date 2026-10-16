import { Inter } from 'next/font/google';
import './globals.css';
import SmoothScrollProvider from './providers/SmoothScrollProvider';
import ChatWidgets from '../components/layout/ChatWidgets';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'VAULTEX — Premium Investment Platform',
  description: 'Grow your wealth with professional investment plans. Secure, transparent, and rewarding.',
  keywords: 'investment, crypto, BTC, returns, wealth management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Font Awesome for icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-navy-900 text-white antialiased overflow-x-hidden">
        <SmoothScrollProvider>
          {children}
           <ChatWidgets /> 
        </SmoothScrollProvider>
      <Toaster />
   
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#16162a',
              color: '#f0f0fa',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '10px',
              fontSize: '13px',
            },
            success: {
              iconTheme: { primary: '#c9a84c', secondary: '#0a0a0f' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}