# Literkowo — opcjonalny backend (nieaktywny)

**Aktualna wersja aplikacji nie korzysta z kont ani z Supabase.** Postępy są przechowywane lokalnie w przeglądarce urządzenia. Nie trzeba zakładać konta ani konfigurować żadnego serwera.

Poniższy kod pozostaje w repozytorium wyłącznie jako materiał do ewentualnego rozwoju synchronizacji między urządzeniami w przyszłości. Nie jest wymagany do działania PWA, a workflow wdrożeniowy uruchamia się wyłącznie ręcznie. Nie konfiguruj go na potrzeby obecnej wersji.

## Dokumentacja techniczna backendu (nieaktywnego)
## Zasady i zabezpieczenia
- Nick 3–20 znaków: litery A–Z, cyfry i podkreślenie.
- Nicki są globalnie unikalne, bez rozróżniania wielkości liter. Ograniczenie UNIQUE w PostgreSQL rozstrzyga również równoczesne próby rejestracji.
- Hasła są hashowane PBKDF2-HMAC-SHA-256 (310 000 iteracji) z losową solą.
- Token sesji jest losowy, a w bazie przechowywany jest wyłącznie jego skrót SHA-256.
- Ograniczanie prób logowania i rejestracji.
- Tabele nie są dostępne dla kluczy anon/authenticated; dostęp do nich ma wyłącznie funkcja serwerowa z kluczem service role.
- Usunięcie konta usuwa sesje i postępy, a nick zostaje zwolniony.
- Nie ma ukrytego konta administratora ani obejścia logowania.

## Jednorazowe przygotowanie projektu Supabase
1. Utwórz bezpłatny projekt na https://supabase.com/ .
2. W projekcie otwórz **SQL Editor → New query**.
3. Skopiuj całą zawartość pliku `supabase/schema.sql`, wklej do edytora i kliknij **Run**.
4. W ustawieniach konta Supabase utwórz **Personal Access Token**. To token do automatycznego wdrażania funkcji z GitHuba — nie wklejaj go do kodu ani do rozmowy.
5. W repozytorium GitHub otwórz **Settings → Secrets and variables → Actions** i dodaj:
   - Repository secret `SUPABASE_ACCESS_TOKEN` — utworzony Personal Access Token.
   - Repository secret `RATE_LIMIT_SECRET` — losowy sekret o długości co najmniej 32 znaków.
   - Repository variable `SUPABASE_PROJECT_REF` — identyfikator projektu, widoczny w adresie projektu Supabase.
6. Zapisz te ustawienia. Workflow GitHub automatycznie wdroży funkcję `literkowo-api` i ustawi jej sekrety.
7. Adres API będzie miał postać:
   `https://SUPABASE_PROJECT_REF.supabase.co/functions/v1/literkowo-api`
8. W pliku `pwa/app.js` ustaw wartość `API_BASE` na powyższy adres z prawdziwym identyfikatorem projektu. Zapisanie zmiany uruchomi publikację GitHub Pages.

## Wdrożenie funkcji
Workflow `.github/workflows/deploy-supabase.yml` wdraża funkcję po zmianach w katalogu `supabase/functions/literkowo-api/` albo ręcznie przez **Actions → Deploy Literkowo Supabase API → Run workflow**.

Wymagane zmienne i sekrety pozostają w ustawieniach GitHuba. Klucz service role jest pobierany przez funkcję z wbudowanego środowiska Supabase i nigdy nie trafia do przeglądarki.

