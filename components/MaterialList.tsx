import { MaterialKind } from '@prisma/client';

type Material = {
  id: string;
  title: string;
  kind: MaterialKind;
  url: string | null;
  storageKey: string | null;
  content: string | null;
  description: string | null;
};

export function MaterialList({ materials }: { materials: Material[] }) {
  if (materials.length === 0) {
    return <p className="text-sm text-slate-600">Zatím tu nejsou žádné materiály.</p>;
  }

  return (
    <div className="space-y-3">
      {materials.map((material) => (
        <article key={material.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{material.title}</h3>
              {material.description ? <p className="mt-1 text-sm text-slate-600">{material.description}</p> : null}
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{material.kind}</span>
          </div>
          {material.kind === 'LINK' && material.url ? (
            <a className="mt-3 inline-block text-sm" href={material.url} target="_blank" rel="noreferrer">Otevřít odkaz</a>
          ) : null}
          {material.kind === 'FILE' && material.storageKey ? (
            <a className="mt-3 inline-block text-sm" href={material.storageKey} target="_blank" rel="noreferrer">Stáhnout soubor</a>
          ) : null}
          {material.kind === 'NOTE' && material.content ? (
            <div className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-800">{material.content}</div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
