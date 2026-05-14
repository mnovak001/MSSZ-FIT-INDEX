import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'FIT SZZ Materiály',
  description: 'Správa okruhů a materiálů ke státnicím FIT VUT.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold text-slate-950">FIT SZZ Materiály</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/specializace">Specializace</Link>
              <Link href="/okruhy">Okruhy</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
