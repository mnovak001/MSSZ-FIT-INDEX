# FIT SZZ Materiály

Webová aplikace pro správu okruhů a materiálů ke státním závěrečným zkouškám FIT VUT.

Základní doménový model je navržený podle principu:

> Primární entita je **okruh**. Specializace má pouze číslovaný seznam okruhů.

Neexistuje samostatná entita „otázka“. Číslo je jen pozice okruhu v seznamu konkrétní specializace a konkrétní verze státnic.

---

## Funkce

- přehled specializací,
- detail specializace s číslovaným seznamem okruhů,
- detail okruhu v kontextu specializace,
- kanonický seznam všech okruhů,
- materiály uložené přímo k okruhům,
- tři typy materiálů:
  - externí odkaz,
  - nahraný soubor,
  - textová/markdown poznámka,
- jednoduchá administrace:
  - verze státnic,
  - specializace,
  - okruhy,
  - mapování okruhů do specializací,
  - materiály.

---

## Technický stack

- Next.js 14 App Router
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Docker Compose pro lokální databázi

---

## Datový model

Hlavní entity:

```text
Specialization
ExamVersion
Topic
SpecializationTopic
Material
Tag
TopicTag
```

### Topic

Kanonický okruh.

```text
Topic {
  id
  title
  description
  scope: COMMON | SPECIALIZATION
}
```

### SpecializationTopic

Položka číslovaného seznamu okruhů pro specializaci.

```text
SpecializationTopic {
  examVersionId
  specializationId
  topicId
  position
  specializationNote
}
```

Význam:

```text
Specializace SWE má ve verzi 2025/2026 na pozici 3 okruh Softwarové architektury.
```

### Material

Materiál patří k okruhu, ne ke specializaci.

```text
Material {
  topicId
  title
  kind: LINK | FILE | NOTE
  url
  storageKey
  content
}
```

---

## Požadavky

- Node.js 20+
- npm
- Docker a Docker Compose

---

## Lokální spuštění

### 1. Instalace závislostí

```bash
npm install
```

### 2. Nastavení prostředí

```bash
cp .env.example .env
```

Výchozí `.env.example` počítá s databází z přiloženého `docker-compose.yml`:

```env
DATABASE_URL="postgresql://fit:fit@localhost:5432/fit_szz?schema=public"
NEXT_PUBLIC_APP_NAME="FIT SZZ Materiály"
```

### 3. Spuštění PostgreSQL

```bash
docker compose up -d
```

### 4. Vytvoření databázového schématu

```bash
npm run db:migrate
```

Prisma se zeptá na název migrace. Například:

```text
init
```

Alternativně bez vytváření migračních souborů:

```bash
npm run db:push
```

### 5. Naplnění ukázkovými daty

```bash
npm run db:seed
```

### 6. Spuštění aplikace

```bash
npm run dev
```

Aplikace poběží na:

```text
http://localhost:3000
```

---

## Důležité URL

```text
/                         hlavní stránka
/specializace             seznam specializací
/specializace/swe         detail specializace
/okruhy                   seznam okruhů
/admin                    administrace
/admin/okruhy             správa okruhů
/admin/specializace       správa specializací
/admin/mapovani           mapování okruhů do specializací
/admin/materialy          správa materiálů
```

---

## Upload souborů

V MVP se soubory ukládají lokálně do:

```text
public/uploads
```

Do databáze se ukládá pouze cesta, například:

```text
/uploads/1712345678-skriptum.pdf
```

Pro produkci doporučuji tuto část nahradit objektovým úložištěm:

- S3,
- Cloudflare R2,
- MinIO,
- Supabase Storage.

Stačí upravit funkci:

```text
lib/storage.ts
```

---

## Doporučený produkční deployment

### Aplikace

- Vercel
- Railway
- Render
- vlastní VPS

### Databáze

- Supabase PostgreSQL
- Neon
- Railway PostgreSQL
- vlastní PostgreSQL

### Soubory

- Cloudflare R2
- S3
- MinIO
- Supabase Storage

---

## Běžné příkazy

```bash
npm run dev          # vývojový server
npm run build        # produkční build
npm run start        # spuštění produkčního buildu
npm run db:studio    # Prisma Studio
npm run db:seed      # ukázková data
npm run db:push      # rychlé propsání schématu do DB
npm run db:migrate   # migrace pro vývoj
```

---

## Poznámky k dalšímu rozšíření

V projektu zatím není autentizace ani role. Doporučený další vývoj:

- přihlášení přes Google OAuth nebo školní účet,
- role admin/editor/student,
- schvalování nových materiálů,
- hlasování o kvalitě materiálů,
- hlášení nefunkčních odkazů,
- fulltextové vyhledávání,
- import/export okruhů v CSV,
- verzování materiálů,
- audit log změn,
- přesun souborů z lokálního disku do S3/R2.

---

## Struktura projektu

```text
app/                  Next.js stránky a server actions
components/           Sdílené React komponenty
lib/                  Prisma klient a storage helper
prisma/               Prisma schema a seed data
public/uploads/       Lokální uploadované soubory
docker-compose.yml    Lokální PostgreSQL
```

---

## Doménové pravidlo

Tento projekt záměrně nepoužívá entitu `Question`.

Správné uvažování je:

```text
Okruh je znalostní jednotka.
Specializace má číslovaný seznam okruhů.
Číslo je pouze pozice v seznamu specializace.
Materiály patří k okruhu.
```
