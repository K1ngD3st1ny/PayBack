import { Inter, Orbitron } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import VideoBackground from '@/components/VideoBackground';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

export const metadata = {
  title: 'PayBack // Neon',
  description: 'Cyberpunk Expense Settlement',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${orbitron.variable} font-sans antialiased overflow-x-hidden`}>
        <VideoBackground />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
