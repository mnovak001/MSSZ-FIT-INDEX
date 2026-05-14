import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { deleteMaterial } from '../actions';
import { checkAdminAuth, handleSignOut } from '../auth-actions';
import { MaterialForm } from './MaterialForm';

export const dynamic = 'force-dynamic';

export default async function AdminMaterialsPage() {
  const user = await checkAdminAuth();
  
  const [topics, materials] = await Promise.all([
    prisma.topic.findMany({ orderBy: { title: 'asc' } }),
    prisma.material.findMany({ orderBy: { createdAt: 'desc' }, include: { topic: true } })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm">← Administrace</Link>
          <h1 className="text-3xl font-bold">Správa materiálů</h1>
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
        <h2 className="text-xl font-semibold">Nový materiál</h2>
        <MaterialForm topics={topics} />
      </section>
      <section className="card">
        <h2 className="mb-4 text-xl font-semibold">Existující materiály</h2>
        <div className="divide-y divide-slate-200">
          {materials.map((material) => (
            <div key={material.id} className="py-3 text-sm flex items-start justify-between gap-4">
              <div>
                <strong>{material.title}</strong> <span className="text-slate-500">({material.kind}, {material.topic.title})</span>
                {material.description && <p className="mt-1 text-slate-600">{material.description}</p>}
                {material.url && (
                  <p className="mt-1">
                    <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {material.url}
                    </a>
                  </p>
                )}
                {material.storageKey && (
                  <p className="mt-1">
                    <a href={material.storageKey} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Stáhnout soubor
                    </a>
                  </p>
                )}
                {material.content && (
                  <p className="mt-2 p-3 bg-slate-50 rounded border border-slate-200 whitespace-pre-wrap">{material.content}</p>
                )}
              </div>
              <form action={deleteMaterial}>
                <input type="hidden" name="id" value={material.id} />
                <button type="submit" className="btn btn-secondary text-sm text-red-600 hover:text-red-700">Smazat</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
