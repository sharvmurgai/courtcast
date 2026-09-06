import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CourtCast — Real-time basketball intelligence',
  description:
    'An interactive portfolio prototype for predicting basketball actions, defensive responses, and coaching adjustments in real time.',
  openGraph: {
    title: 'CourtCast — See the possession. Predict the decision.',
    description:
      'A real-time basketball intelligence concept with synchronized film, model tracking, coach profiles, and next-action probabilities.',
    type: 'website',
    images: [{ url: '/courtcast-social.png', width: 1792, height: 1008, alt: 'CourtCast basketball intelligence interface' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CourtCast — See the possession. Predict the decision.',
    description: 'Film, tracking, living playbooks, and real-time next-action prediction.',
    images: ['/courtcast-social.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
