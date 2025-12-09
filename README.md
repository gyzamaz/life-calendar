# Kalendarz życia

Interaktywna aplikacja wizualizująca całe życie w postaci siatki miesięcy.  
Możesz kolorować okresy (nauka, praca, emerytura itp.), dodawać ważne notatki do konkretnych miesięcy oraz tworzyć linię czasu z kluczowymi wydarzeniami.

Aplikacja działa całkowicie w przeglądarce – dane są zapisywane w `localStorage`, bez backendu.

---

## Funkcje

- 🎨 **Kolorowanie życia**
  - Każdy kwadrat to jeden miesiąc życia.
  - Różne kategorie: nauka, praca, emerytura, inne, brak.
  - Malowanie „pędzlem” poprzez przeciąganie po siatce lub pojedyncze klikanie.

- ⚙️ **Szybka konfiguracja etapów**
  - Osobna sekcja do ustawiania:
    - wieku rozpoczęcia liceum / szkoły średniej,
    - studiów,
    - kariery zawodowej,
    - wieku przejścia na emeryturę.
  - Automatyczne pokolorowanie odpowiednich zakresów lat.

- 🧬 **Aktualna pozycja w życiu**
  - Po ustawieniu roku i miesiąca urodzenia aplikacja:
    - podświetla aktualny miesiąc życia,
    - pokazuje aktualny wiek w latach.

- 📝 **Notatki / kamienie milowe**
  - Do każdego miesiąca możesz dodać:
    - tytuł,
    - opis,
    - znacznik „ważne”.
  - Ważne miesiące są wyróżnione (np. gwiazdką) na osi życia.
  - Specjalny panel po prawej stronie do edycji notatek wybranej kratki.

- 📌 **Wydarzenia życiowe**
  - Możliwość dodania długotrwających wydarzeń, np.:
    - praca w danej firmie,
    - związek,
    - przeprowadzka,
    - narodziny dziecka,
    - problemy zdrowotne.
  - Dla każdego wydarzenia:
    - typ (praca, nauka, dziecko, relacja, zdrowie, strata, przeprowadzka, inne),
    - tytuł,
    - data startu (rok + miesiąc),
    - data końca (lub „trwa nadal”),
    - kolor,
    - ikonka.
  - Wydarzenia są wizualizowane:
    - bezpośrednio w siatce (kolorowe paseczki/ikonki w kratkach),
    - na poziomej osi czasu.

- 📊 **Podsumowanie**
  - Liczba miesięcy w każdej kategorii (nauka, praca, emerytura, inne).
  - Szybki wgląd w to, jak rozkłada się życie w czasie.

- 🌐 **Wielojęzyczność**
  - Obsługa wielu języków (np. PL/EN) przez własny moduł `i18n`.
  - Przełącznik języka w nagłówku.

- 💾 **Autozapis**
  - Wszystko zapisuje się automatycznie w `localStorage` przeglądarki:
    - ustawienia (język, maksymalny wiek, rok/miesiąc urodzenia),
    - pokolorowane kratki,
    - konfiguracja etapów,
    - notatki (milestones),
    - wydarzenia.

---

## @todo

- 📄 **Eksport do PDF**
  - Możliwość wygenerowania PDF z widokiem kalendarza życia.
  - Obsługa większej wysokości (content może się rozkładać na kilka stron).

---

## Stos technologiczny

- **Next.js / React** (aplikacja kliencka, `use client`)
- **TypeScript**
- **Tailwind CSS** (styling)
- **html2canvas** + **jsPDF** (eksport do PDF)
- `localStorage` (persistencja danych po stronie przeglądarki)
- Yarn jako menedżer pakietów

---

## Wymagania

- Node.js (zalecane LTS)
- Yarn zainstalowany globalnie:
  ```bash
  npm install -g yarn
  ```
- Zainstaluj zależności
- Uruchom tryb deweloperski
  ```bash
  yarn run dev
  ```

- Otwórz aplikację w przeglądarce
