import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { createExamVersion } from './actions';
import { checkAdminAuth, handleSignOut } from './auth-actions';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await checkAdminAuth();
  const versions = await prisma.examVersion.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administrace</h1>
          <p className="mt-2 text-slate-600">Správa verzí státnic, okruhů, specializací, mapování a materiálů.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            Přihlášen jako: <strong>{user.name || user.email}</strong>
          </span>
          <form action={handleSignOut}>
            <button type="submit" className="btn btn-secondary text-sm">Odhlásit se</button>
          </form>
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <Link href="/admin/okruhy" className="card block hover:border-slate-400"><h2 className="font-semibold">Okruhy</h2><p className="mt-2 text-sm text-slate-600">Vytváření kanonických okruhů.</p></Link>
        <Link href="/admin/specializace" className="card block hover:border-slate-400"><h2 className="font-semibold">Specializace</h2><p className="mt-2 text-sm text-slate-600">Správa specializací.</p></Link>
        <Link href="/admin/mapovani" className="card block hover:border-slate-400"><h2 className="font-semibold">Mapování</h2><p className="mt-2 text-sm text-slate-600">Číslované seznamy okruhů.</p></Link>
        <Link href="/admin/materialy" className="card block hover:border-slate-400"><h2 className="font-semibold">Materiály</h2><p className="mt-2 text-sm text-slate-600">Odkazy, soubory a poznámky.</p></Link>
      </section>
      <section className="card">
        <h2 className="text-xl font-semibold">Verze státnic</h2>
        <form action={createExamVersion} className="mt-4 grid gap-3 md:grid-cols-4">
          <div><label className="label">Název</label><input className="input" name="name" placeholder="FIT VUT SZZ 2025/2026" required /></div>
          <div><label className="label">Akademický rok</label><input className="input" name="academicYear" placeholder="2025/2026" /></div>
          <label className="mt-7 flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" /> Aktivní</label>
          <button className="btn mt-6" type="submit">Přidat verzi</button>
        </form>
        <div className="mt-6 divide-y divide-slate-200">
          {versions.map((version) => (
            <div key={version.id} className="flex justify-between py-3 text-sm">
              <span>{version.name} {version.academicYear ? `(${version.academicYear})` : ''}</span>
              {version.isActive ? <span className="font-medium text-green-700">aktivní</span> : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
