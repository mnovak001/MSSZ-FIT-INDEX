import { TopicScope } from '@prisma/client';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { createTopic } from '../actions';
import { checkAdminAuth, handleSignOut } from '../auth-actions';

export const dynamic = 'force-dynamic';

export default async function AdminTopicsPage() {
  const user = await checkAdminAuth();
  const topics = await prisma.topic.findMany({ orderBy: { title: 'asc' } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm">← Administrace</Link>
          <h1 className="text-3xl font-bold">Správa okruhů</h1>
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
        <h2 className="text-xl font-semibold">Nový okruh</h2>
        <form action={createTopic} className="mt-4 grid gap-4">
          <div><label className="label">Název</label><input className="input" name="title" required /></div>
          <div><label className="label">Popis</label><textarea className="input min-h-24" name="description" /></div>
          <div><label className="label">Typ</label><select className="input" name="scope" defaultValue={TopicScope.SPECIALIZATION}><option value={TopicScope.COMMON}>Společný</option><option value={TopicScope.SPECIALIZATION}>Specializační</option></select></div>
          <button className="btn w-fit" type="submit">Vytvořit okruh</button>
        </form>
      </section>
      <section className="card">
        <h2 className="mb-4 text-xl font-semibold">Existující okruhy</h2>
        <div className="divide-y divide-slate-200">
          {topics.map((topic) => <div key={topic.id} className="py-3"><Link href={`/okruhy/${topic.id}`} className="font-medium">{topic.title}</Link><p className="text-sm text-slate-500">{topic.scope}</p></div>)}
        </div>
      </section>
    </div>
  );
}
