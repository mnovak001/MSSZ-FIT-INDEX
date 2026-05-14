import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { EmptyState } from '@/components/EmptyState';

export default async function TopicsPage() {
  const topics = await prisma.topic.findMany({
    orderBy: [{ scope: 'asc' }, { title: 'asc' }],
    include: { materials: true, specializations: { include: { specialization: true } } }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Okruhy</h1>
        <p className="mt-2 text-slate-600">Kanonický seznam společných i specializačních okruhů.</p>
      </div>
      {topics.length === 0 ? <EmptyState title="Žádné okruhy" /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic) => (
          <Link key={topic.id} href={`/okruhy/${topic.id}`} className="card block hover:border-slate-400">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold">{topic.title}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{topic.scope === 'COMMON' ? 'společný' : 'specializační'}</span>
            </div>
            {topic.description ? <p className="mt-2 text-sm text-slate-600">{topic.description}</p> : null}
            <p className="mt-4 text-sm text-slate-500">{topic.materials.length} materiálů · {topic.specializations.length} použití</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
