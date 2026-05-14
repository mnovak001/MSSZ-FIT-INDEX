import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MaterialList } from '@/components/MaterialList';
import { prisma } from '@/lib/prisma';

export default async function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      materials: { orderBy: { createdAt: 'desc' } },
      specializations: { orderBy: { position: 'asc' }, include: { specialization: true, examVersion: true } }
    }
  });
  if (!topic) notFound();

  return (
    <div className="space-y-6">
      <Link href="/okruhy" className="text-sm">← Zpět na okruhy</Link>
      <section className="card">
        <p className="text-sm font-medium text-slate-500">{topic.scope === 'COMMON' ? 'Společný okruh' : 'Specializační okruh'}</p>
        <h1 className="mt-2 text-3xl font-bold">{topic.title}</h1>
        {topic.description ? <p className="mt-3 text-slate-700">{topic.description}</p> : null}
      </section>
      <section className="card">
        <h2 className="mb-4 text-xl font-semibold">Materiály</h2>
        <MaterialList materials={topic.materials} />
      </section>
      <section className="card">
        <h2 className="mb-4 text-xl font-semibold">Výskyt ve specializacích</h2>
        <ul className="space-y-2 text-sm">
          {topic.specializations.map((usage) => (
            <li key={usage.id}>
              <Link href={`/specializace/${usage.specialization.code.toLowerCase()}/okruhy/${usage.position}`}>
                {usage.specialization.code} – {usage.specialization.name}, č. {usage.position}, {usage.examVersion.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
