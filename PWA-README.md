# Literkowo PWA

Wersja przeglądarkowa aplikacji Literkowo, przygotowana jako osobny katalog `pwa/`. Projekt natywny SwiftUI pozostaje bez zmian.

## Funkcje
- 32 litery polskiego alfabetu i wzorce ruchów przeniesione z wersji SwiftUI.
- Rysowanie palcem, porównanie śladu z wzorcem oraz sprawdzanie kolejności i kierunku ruchów.
- Wskazówki pisania, sylaby, wyrazy i odczytywanie przez Web Speech API (jeśli iOS udostępnia polski głos).
- Gwiazdki i postępy zapisane lokalnie w pamięci przeglądarki.
- Manifest PWA i Service Worker do działania offline po pierwszym poprawnym załadowaniu.
- Brak kont, reklam, analityki i zewnętrznych usług AI.

## Uruchomienie na iPhonie
PWA wymaga bezpiecznego adresu HTTPS (lub localhost w środowisku deweloperskim). Po wdrożeniu otwórz adres w Safari, wybierz Udostępnij, a następnie Dodaj do ekranu początkowego.

## Prywatność i ograniczenia
Aplikacja nie wymaga hasła ani logowania. Ograniczenie indeksowania przez `robots.txt` i meta robots nie jest kontrolą dostępu. Każda osoba posiadająca adres może otworzyć aplikację; nie wolno traktować niepublicznego linku jako zabezpieczenia poufnych danych. Postępy są przechowywane lokalnie w przeglądarce danego urządzenia i nie są synchronizowane. Wyczyszczenie danych Safari może usunąć zapisane postępy.

## Publikacja
Katalog `pwa/` można wdrożyć jako statyczną stronę HTTPS na hostingu obsługującym statyczne pliki. Ustaw katalog publikacji na `pwa`. Przed publikacją wybierz losowy, trudny do odgadnięcia adres lub nazwę projektu. Nie publikuj adresu w README publicznym ani w mediach społecznościowych. To ogranicza przypadkowe odkrycie, ale nie zapewnia prywatności ani autoryzacji.

## Testy
Sprawdź na iPhonie: otwieranie wszystkich 32 liter, rysowanie każdego ruchu osobno, akceptację poprawnego śladu, odrzucanie błędnej kolejności/kierunku, odtwarzanie mowy, zapis postępów, reset oraz działanie offline po pierwszym załadowaniu. Dostępność głosu polskiego zależy od konfiguracji iOS/Safari.