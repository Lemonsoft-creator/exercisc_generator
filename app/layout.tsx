import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sportübungen Workflow',
  description: 'Klickbares Frontend für den Sportübungen-Workflow'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
