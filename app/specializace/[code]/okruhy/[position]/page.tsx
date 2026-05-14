import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MaterialList } from '@/components/MaterialList';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SpecializationTopicPage({ params }: { params: Promise<{ code: string; position: string }> }) {
  const { code, position: positionStr } = await params;
  const position = Number(positionStr);
  if (!Number.isInteger(position)) notFound();

  const specialization = await prisma.specialization.findUnique({ where: { code: code.toUpperCase() } });
  if (!specialization) notFound();

  const item = await prisma.specializationTopic.findFirst({
    where: { specializationId: specialization.id, position },
    include: {
      topic: { include: { materials: { orderBy: { createdAt: 'desc' } }, specializations: { include: { specialization: true } } } },
      examVersion: true
    }
  });
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <Link href={`/specializace/${specialization.code.toLowerCase()}`} className="text-sm">← Zpět na specializaci</Link>
      <section className="card">
        <p className="text-sm font-medium text-slate-500">{specialization.code}, okruh č. {item.position}</p>
        <h1 className="mt-2 text-3xl font-bold">{item.topic.title}</h1>
        {item.topic.description ? <p className="mt-3 text-slate-700">{item.topic.description}</p> : null}
        {item.specializationNote ? <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-950"><strong>Poznámka pro specializaci:</strong> {item.specializationNote}</div> : null}
      </section>
      <section className="card">
        <h2 className="mb-4 text-xl font-semibold">Materiály</h2>
        <MaterialList materials={item.topic.materials} />
      </section>
      <section className="card">
        <h2 className="mb-4 text-xl font-semibold">Použito také ve specializacích</h2>
        <ul className="space-y-2 text-sm">
          {item.topic.specializations.map((usage) => (
            <li key={usage.id}>
              <Link href={`/specializace/${usage.specialization.code.toLowerCase()}/okruhy/${usage.position}`}>
                {usage.specialization.code} – {usage.specialization.name}, č. {usage.position}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
