import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { mapTopicToSpecialization } from '../actions';
import { checkAdminAuth, handleSignOut } from '../auth-actions';

export const dynamic = 'force-dynamic';

export default async function AdminMappingPage() {
  const user = await checkAdminAuth();
  
  const [versions, specializations, topics, mappings] = await Promise.all([
    prisma.examVersion.findMany({ orderBy: [{ isActive: 'desc' }, { name: 'desc' }] }),
    prisma.specialization.findMany({ orderBy: { code: 'asc' } }),
    prisma.topic.findMany({ orderBy: { title: 'asc' } }),
    prisma.specializationTopic.findMany({ orderBy: [{ specialization: { code: 'asc' } }, { position: 'asc' }], include: { specialization: true, topic: true, examVersion: true } })
  ]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm">← Administrace</Link>
          <h1 className="text-3xl font-bold">Mapování okruhů do specializací</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {user.name || user.email}
          </span>
          <form action={handleSignOut}>
            <button type="submit" className="btn btn-secondary text-sm">Odhlásit se</button>
          </form>
        </div>
      </div>
      <section className="card">
        <h2 className="text-xl font-semibold">Přidat položku seznamu</h2>
        <form action={mapTopicToSpecialization} className="mt-4 grid gap-4 md:grid-cols-2">
          <div><label className="label">Verze státnic</label><select className="input" name="examVersionId" required>{versions.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
          <div><label className="label">Specializace</label><select className="input" name="specializationId" required>{specializations.map((s) => <option key={s.id} value={s.id}>{s.code} – {s.name}</option>)}</select></div>
          <div><label className="label">Okruh</label><select className="input" name="topicId" required>{topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></div>
          <div><label className="label">Číslo v seznamu</label><input className="input" name="position" type="number" min="1" required /></div>
          <div className="md:col-span-2"><label className="label">Poznámka pro specializaci</label><textarea className="input min-h-24" name="specializationNote" /></div>
          <button className="btn w-fit" type="submit">Přidat mapování</button>
        </form>
      </section>
      <section className="card">
        <h2 className="mb-4 text-xl font-semibold">Aktuální mapování</h2>
        <div className="divide-y divide-slate-200">
          {mappings.map((m) => <div key={m.id} className="py-3 text-sm"><strong>{m.specialization.code}</strong> č. {m.position}: {m.topic.title} <span className="text-slate-500">({m.examVersion.name})</span></div>)}
        </div>
      </section>
    </div>
  );
}
