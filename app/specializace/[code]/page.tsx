import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { EmptyState } from '@/components/EmptyState';

export default async function SpecializationDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const specialization = await prisma.specialization.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      topics: {
        orderBy: { position: 'asc' },
        include: {
          topic: { include: { materials: true } },
          examVersion: true
        }
      }
    }
  });

  if (!specialization) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">{specialization.code}</p>
        <h1 className="text-3xl font-bold">{specialization.name}</h1>
        {specialization.description ? <p className="mt-2 text-slate-600">{specialization.description}</p> : null}
      </div>
      <section className="card">
        <h2 className="mb-4 text-xl font-semibold">Seznam okruhů</h2>
        {specialization.topics.length === 0 ? <EmptyState title="Seznam je prázdný" description="Přidej mapování okruhů v administraci." /> : null}
        <div className="divide-y divide-slate-200">
          {specialization.topics.map((item) => (
            <Link key={item.id} href={`/specializace/${specialization.code.toLowerCase()}/okruhy/${item.position}`} className="flex items-center justify-between gap-4 py-4 hover:bg-slate-50">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">{item.position}</span>
                <div>
                  <h3 className="font-semibold text-slate-950">{item.topic.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.topic.description}</p>
                  {item.specializationNote ? <p className="mt-2 text-sm italic text-slate-500">{item.specializationNote}</p> : null}
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{item.topic.materials.length} materiálů</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
