# Literkowo API — Cloudflare Workers + D1

Backend kont i synchronizacji postępów. GitHub Pages pozostaje hostingiem PWA.

## Zasady kont
- Nick i hasło, bez e-maila i numeru telefonu.
- Nick: 3–20 znaków, litery A–Z, cyfry i podkreślenie.
- Nicki są unikalne globalnie i bez rozróżniania wielkości liter (Kasia = kasia). Wymusza to ograniczenie UNIQUE w D1, więc równoczesne rejestracje również są bezpieczne.
- Hasła są hashowane PBKDF2-HMAC-SHA-256 (310 000 iteracji) z losową solą. Nie zapisujemy haseł jawnie.
- Losowy token sesji jest przechowywany w bazie wyłącznie w postaci SHA-256.
- Ograniczanie prób logowania/rejestracji, CORS tylko dla domeny PWA, HTTPS.
- Postępy są przypisane do konta. Usunięcie konta usuwa sesje i postępy, a nick zostaje zwolniony.
- Nie ma ukrytego konta administratora ani obejścia logowania.

## Wdrożenie (wymaga konta Cloudflare)
1. Utwórz bazę D1 o nazwie `literkowo`.
2. Wykonaj `cloudflare/schema.sql` jako migrację D1.
3. W `cloudflare/wrangler.toml` wstaw rzeczywisty `database_id`.
4. Ustaw sekret `RATE_LIMIT_SECRET` (losowy ciąg co najmniej 32 bajtów) poleceniem `npx wrangler secret put RATE_LIMIT_SECRET --config cloudflare/wrangler.toml`.
5. Z katalogu głównego repozytorium wykonaj:
   ```sh
   npx wrangler d1 create literkowo
   npx wrangler d1 execute literkowo --remote --file=cloudflare/schema.sql --config cloudflare/wrangler.toml
   npx wrangler deploy --config cloudflare/wrangler.toml
   ```
6. Ustaw `ALLOWED_ORIGIN` na dokładny adres GitHub Pages.
7. Sprawdź endpoint `/health` wdrożonego Workera.

## Endpointy
- `POST /register` — rejestracja; JSON: `{"username":"...","password":"..."}`.
- `POST /login` — logowanie.
- `GET /me` — bieżące konto.
- `GET /progress` i `PUT /progress` — odczyt/zapis postępów.
- `POST /logout` — unieważnienie sesji.
- `DELETE /account` — usunięcie konta i zwolnienie nicku.

Żądania po zalogowaniu wymagają nagłówka `Authorization: Bearer <token>`. Token w kliencie należy trzymać wyłącznie w `sessionStorage`, nie w `localStorage`.

## Ważne ograniczenie
Nie ma automatycznego odzyskiwania hasła, ponieważ konta nie mają adresu e-mail ani numeru telefonu. Użytkownik musi zachować hasło w bezpiecznym miejscu. Nie dodajemy backdoora administratora. Bez dostępu do konta Cloudflare nie da się utworzyć bazy ani opublikować API z poziomu samego GitHuba; pliki backendu są przygotowane w tym repozytorium, ale API nie jest jeszcze wdrożone.
