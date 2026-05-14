# Deployment Guide - FIT SZZ Materiály

## Docker Compose Nasazení

Tato aplikace je připravena pro nasazení pomocí Docker Compose.

### 1. Příprava Environment Proměnných

Vytvořte si `.env` soubor v kořenovém adresáři:

```bash
# Database Configuration
DB_USER=fit
DB_PASSWORD=vyberte_silne_heslo
DB_NAME=fit_szz
DB_PORT=5432

# NextAuth (GENERUJTE NOVÝ!)
# Použijte: openssl rand -base64 32
NEXTAUTH_SECRET=vase_nahodne_heslo_zde

# Admin Credentials (ZMĚŇTE PRO PRODUKCI!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=vyberte_silne_heslo_min_12_znaků

# Ports (volitelné - výchozí hodnoty jsou v pořádku)
HTTP_PORT=80
HTTPS_PORT=443
```

### 2. SSL Certifikáty

Pro produkci potřebujete SSL certifikáty. Máte dvě možnosti:

#### Možnost A: Let's Encrypt (Doporučeno)

```bash
# Vytvořte složku pro certifikáty
mkdir -p ssl

# Použijte certbot pro získání certifikátů
# docker run --rm -v $(pwd)/ssl:/etc/letsencrypt certbot/certbot certonly --standalone -d yourdomain.com
```

#### Možnost B: Vlastní certifikáty

Umístěte své certifikáty do složky `ssl/`:
- `ssl/cert.pem` - veřejný certifikát
- `ssl/key.pem` - soukromý klíč

### 3. Spuštění Aplikace

```bash
# Postavení a spuštění všech kontejnerů
docker-compose up -d --build

# Zkontrolovat stav
docker-compose ps

# Sledovat logy
docker-compose logs -f
```

### 4. Inicializace Databáze

Po prvním spuštění inicializujte databázi:

```bash
# Připojte se k PostgreSQL kontejneru
docker-compose exec postgres psql -U fit -d fit_szz

# Nebo spusťte migrations
docker-compose exec nextjs npx prisma migrate deploy
docker-compose exec nextjs npx prisma db seed
```

### 5. Přístup k Aplikaci

- HTTP: http://localhost (automatický redirect na HTTPS)
- HTTPS: https://localhost

**Poznámka:** Pro localhost můžete použít self-signed certifikát nebo dočasně vypnout HTTPS.

## Vývojové Nasazení (bez HTTPS)

Pro vývoj bez HTTPS upravte `nginx.conf`:

1. Odstraňte HTTPS server blok
2. Změňte HTTP port na 8080
3. Upravte `proxy_pass` URL

Nebo běžte přímo Next.js kontejner:

```bash
docker-compose up -d nextjs postgres
# Přístup na http://localhost:3000
```

## Port Konfigurace

Porty lze změnit v `docker-compose.yml`:

| Service | Variable | Default | Popis |
|---------|----------|---------|-------|
| PostgreSQL | DB_PORT | 5432 | Port databáze |
| Nginx HTTP | HTTP_PORT | 80 | HTTP port |
| Nginx HTTPS | HTTPS_PORT | 443 | HTTPS port |

Příklad změny portů:
```bash
export HTTP_PORT=8080
export HTTPS_PORT=8443
docker-compose up -d
```

## Správa Kontejnerů

```bash
# Zastavit všechny kontejnery
docker-compose down

# Zastavit a smazat data (pozor!)
docker-compose down -v

# Restartovat službu
docker-compose restart nginx

# Zobrazit logy
docker-compose logs nginx
docker-compose logs nextjs
docker-compose logs postgres

# Přistoupit k shell kontejneru
docker-compose exec nextjs sh
docker-compose exec postgres psql -U fit -d fit_szz
```

## Bezpečnostní Doporučení

1. **Vždy měňte výchozí hesla** v `.env` souboru
2. **Používejte HTTPS** v produkci
3. **Regenerujte NEXTAUTH_SECRET** pro každé nasazení
4. **Omezte přístup k databázi** firewall pravidly
5. **Pravidelně aktualizujte** Docker image a závislosti
6. **Nastavte backup** pro PostgreSQL data

## Troubleshooting

### Aplikace se nenačítá
```bash
# Zkontrolujte logy
docker-compose logs nextjs

# Znovu postněte
docker-compose build --no-cache nextjs
docker-compose up -d nextjs
```

### Databázové problémy
```bash
# Reset databáze (POZOR - smaže všechna data!)
docker-compose down -v
docker-compose up -d
```

### SSL problémy
```bash
# Zkontrolujte certifikáty
ls -la ssl/
docker-compose exec nginx ls -la /etc/nginx/ssl/
```

## Health Check

Aplikace má health check endpoint:
```bash
curl https://localhost/health
```

## Backup

```bash
# Backup databáze
docker-compose exec postgres pg_dump -U fit fit_szz > backup.sql

# Restore databáze
docker-compose exec postgres psql -U fit fit_szz < backup.sql

# Backup uploadů
tar -czf uploads_backup.tar.gz uploads_data/