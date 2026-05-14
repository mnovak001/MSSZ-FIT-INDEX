import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const [specializations, topics, materials] = await Promise.all([
    prisma.specialization.count(),
    prisma.topic.count(),
    prisma.material.count()
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-slate-950 p-8 text-white">
        <p className="text-sm font-medium text-slate-300">FIT VUT SZZ</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight">Správa okruhů a materiálů ke státnicím</h1>
        <p className="mt-4 max-w-2xl text-slate-300">Okruh je primární entita. Specializace mají pouze číslovaný seznam okruhů a materiály se ukládají přímo k okruhům.</p>
        <div className="mt-6 flex gap-3">
          <Link className="btn bg-white text-slate-950 hover:bg-slate-100" href="/specializace">Zobrazit specializace</Link>
          <Link className="btn-secondary border-slate-700 bg-slate-900 text-white hover:bg-slate-800" href="/admin">Správa</Link>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-500">Specializace</p><p className="mt-2 text-3xl font-bold">{specializations}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Okruhy</p><p className="mt-2 text-3xl font-bold">{topics}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Materiály</p><p className="mt-2 text-3xl font-bold">{materials}</p></div>
      </section>
    </div>
  );
}
