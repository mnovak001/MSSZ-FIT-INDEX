import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { createSpecialization } from '../actions';
import { checkAdminAuth, handleSignOut } from '../auth-actions';

export const dynamic = 'force-dynamic';

export default async function AdminSpecializationsPage() {
  const user = await checkAdminAuth();
  const specializations = await prisma.specialization.findMany({ orderBy: { code: 'asc' } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm">← Administrace</Link>
          <h1 className="text-3xl font-bold">Správa specializací</h1>
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
        <h2 className="text-xl font-semibold">Nová specializace</h2>
        <form action={createSpecialization} className="mt-4 grid gap-4">
          <div><label className="label">Kód</label><input className="input" name="code" placeholder="SWE" required /></div>
          <div><label className="label">Název</label><input className="input" name="name" required /></div>
          <div><label className="label">Popis</label><textarea className="input min-h-24" name="description" /></div>
          <button className="btn w-fit" type="submit">Vytvořit specializaci</button>
        </form>
      </section>
      <section className="card">
        <h2 className="mb-4 text-xl font-semibold">Existující specializace</h2>
        <div className="divide-y divide-slate-200">
          {specializations.map((specialization) => <div key={specialization.id} className="py-3"><Link href={`/specializace/${specialization.code.toLowerCase()}`} className="font-medium">{specialization.code} – {specialization.name}</Link></div>)}
        </div>
      </section>
    </div>
  );
}
