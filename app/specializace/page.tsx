import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

export default async function SpecializationsPage() {
  const specializations = await prisma.specialization.findMany({
    orderBy: { code: 'asc' },
    include: { topics: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Specializace</h1>
        <p className="mt-2 text-slate-600">Každá specializace má vlastní číslovaný seznam okruhů.</p>
      </div>
      {specializations.length === 0 ? <EmptyState title="Žádné specializace" description="Přidej je v administraci." /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {specializations.map((specialization) => (
          <Link key={specialization.id} href={`/specializace/${specialization.code.toLowerCase()}`} className="card block hover:border-slate-400">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{specialization.name}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">{specialization.code}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{specialization.topics.length} okruhů</span>
            </div>
            {specialization.description ? <p className="mt-3 text-sm text-slate-600">{specialization.description}</p> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
