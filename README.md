# Literkowo

Natywna aplikacja edukacyjna na iPhone'a i iPada, napisana w Swift i SwiftUI.

## Funkcje pierwszej wersji
- Pełny polski alfabet (32 litery).
- Osobny ekran ćwiczenia każdej litery.
- Rysowanie palcem po ekranie.
- Indywidualne, tekstowe wskazówki kolejności kreślenia dla wszystkich 32 liter.
- Wzorce wektorowe dla 32 wielkich liter polskiego alfabetu, z podziałem na osobne ruchy.
- Porównywanie śladu z wzorcem przez równomierne próbkowanie punktów i pomiar odległości.
- Kontrola liczby, kolejności i kierunku ruchów oraz punktów rozpoczęcia i zakończenia.
- Informacja zwrotna po ćwiczeniu; ocena odbywa się lokalnie na urządzeniu.
- Wzór litery widoczny pod rysunkiem.
- Odczytywanie liter przez polski syntezator mowy iOS.
- Lokalny zapis postępów na urządzeniu.
- Działanie bez konta, reklam i połączenia z internetem.

## Jak działa ocena pisania
Wzorzec każdej litery składa się z uporządkowanych ścieżek. Każdy ruch dziecka jest normalizowany do rozmiaru pola, próbkowany w równych odstępach i porównywany z odpowiadającą mu ścieżką wzorcową. Aplikacja sprawdza liczbę ruchów, przebieg linii, kierunek oraz położenie początku i końca. Wynik jest przybliżoną oceną zgodności z uproszczonym wzorcem, a nie profesjonalnym rozpoznawaniem pisma ani diagnozą umiejętności dziecka. Wzorce i próg akceptacji wymagają dalszych testów z dziećmi i specjalistą edukacji wczesnoszkolnej.

## Uruchomienie
1. Otwórz plik projektu Literkowo.xcodeproj w Xcode na komputerze Mac.
2. Wybierz symulator iPhone'a albo podłączone urządzenie.
3. Uruchom projekt przyciskiem Run.

Do kompilacji natywnej aplikacji potrzebny jest Xcode na macOS. Repozytorium przechowuje kod źródłowy, ale samo nie instaluje aplikacji na iPhonie.

## Technologia
- Swift 5
- SwiftUI
- AVFoundation
- UserDefaults

Minimalna wersja iOS: 16.0.
