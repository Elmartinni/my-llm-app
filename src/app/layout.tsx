// app/layout.tsx
import './globals.css'; // Your global styles including Tailwind directives
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Example font

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LLM Chat App',
  description: 'Chat with an intelligent AI assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*
        You could wrap children with an <AuthProvider> here if you created one
        <AuthProvider>
          {children}
        </AuthProvider>
      */}
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
