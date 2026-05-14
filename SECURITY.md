# Bezpečnostní Pokyny - FIT SZZ Materiály

## Přehled Zabezpečení

Tento dokument popisuje bezpečnostní opatření implementovaná v aplikaci a pokyny pro bezpečné nasazení.

## Implementovaná Bezpečnostní Opatření

### 1. Autentizace a Autorizace
- **Rate Limiting**: Omezení na 5 pokusů o přihlášení za 15 minut na uživatele
- **JWT Session**: Session využívá JWT s 24hodinovou platností
- **Role-based Access Control**: Admin role je nutná pro přístup k administraci
- **Password Hashing**: Hesla jsou hashována pomocí bcryptjs

### 2. Ochrana proti XSS (Cross-Site Scripting)
- **Security Headers**: X-XSS-Protection, Content-Security-Policy
- **Input Sanitization**: Vstupy jsou validovány a sanitizovány pomocí Zod
- **Output Escaping**: React automaticky escapejuje výstupy

### 3. Bezpečnostní HLavičky
```
X-Frame-Options: SAMEORIGIN (ochrana proti clickjackingu)
X-XSS-Protection: 1; mode=block (XSS filtr)
X-Content-Type-Options: nosniff (prevence MIME sniffingu)
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 4. Validace Vstupů
- **Zod Schema Validation**: Všechny vstupy jsou validovány
- **UUID Validation**: IDs jsou validovány jako UUID formát
- **Length Limits**: Maximální délky pro všechny stringové vstupy
- **File Validation**: Validace typu a velikosti nahraných souborů

### 5. Bezpečnost Souborů
- **Maximální Velikost**: 10MB na soubor
- **Typy Souborů**: Pouze povolené typy (.pdf, .doc, .docx, .txt, .md, .jpg, .jpeg, .png, .gif, .zip, .rar)
- **Safe Filenames**: Generování bezpečných názvů souborů
- **Isolace**: Nahrané soubory jsou uloženy v odděleném adresáři

## Pokyny pro Produkcni Nasazení

### 1. Nastavení Environment Proměnných

```bash
# GENERUJTE SILNÝ SECRET
openssl rand -base64 32

# NASTAVTE PRODUCTION NODE_ENV
NODE_ENV="production"

# NASTAVTE silné heslo pro admina
ADMIN_PASSWORD="<silné-heslo-min-12-znaků>"
```

### 2. Database Security
- Používejte silné heslo pro PostgreSQL
- Omezte přístup k databázi pouze z localhostu nebo VPN
- Pravidelně zálohujte databázi

### 3. HTTPS/NASLOVÉ CERTIFIKÁTY
- Vždy používejte HTTPS v produkci
- Použijte Let's Encrypt nebo podobný CA
- Nastavte automatické obnovení certifikátů

### 4. Firewall a Network
- Omezte přístup k portu databáze (5432)
- Použijte reverse proxy (nginx, caddy)
- Nastavte rate limiting na úrovni serveru

### 5. Monitoring a Logging
- Sledujte failed login attempts
- Monitorujte uploady souborů
- Nastavte alerting na podezřelou aktivitu

### 6. Regular Updates
- Pravidelně aktualizujte npm balíčky
- Sledujte security advisories
- Testujte aplikace po aktualizacích

## Bezpečnostní Checklist před Nasazením

- [ ] Všechny výchozí hesla změněna
- [ ] NEXTAUTH_SECRET generován náhodně
- [ ] NODE_ENV nastaven na "production"
- [ ] HTTPS nakonfigurováno
- [ ] Database přístup omezen
- [ ] Backup strategie nastavena
- [ ] Monitoring a logging aktivní
- [ ] Rate limiting testováno
- [ ] Security headers ověřeny (např. pomocí https://securityheaders.com)

## Incident Response

Pokud dojde ke bezpečnostní incidentu:

1. **Izolujte** systém z networku
2. **Identifikujte** zdroj a rozsah incidentu
3. **Oznamte** příslušným osobám
4. **Obnovte** z backupu pokud nutné
5. **Dokumentujte** incident a opatření
6. **Revize** bezpečnostních opatření

## Kontakty

Pro bezpečnostní otázky kontaktujte vývojový tým.

---

*Poslední aktualizace: 2024*