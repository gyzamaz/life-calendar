import { Language } from "./types";


export const months = [
    { value: 1, pl: "Styczeń", en: "January" },
    { value: 2, pl: "Luty", en: "February" },
    { value: 3, pl: "Marzec", en: "March" },
    { value: 4, pl: "Kwiecień", en: "April" },
    { value: 5, pl: "Maj", en: "May" },
    { value: 6, pl: "Czerwiec", en: "June" },
    { value: 7, pl: "Lipiec", en: "July" },
    { value: 8, pl: "Sierpień", en: "August" },
    { value: 9, pl: "Wrzesień", en: "September" },
    { value: 10, pl: "Październik", en: "October" },
    { value: 11, pl: "Listopad", en: "November" },
    { value: 12, pl: "Grudzień", en: "December" },
  ];

export const STRINGS: Record<Language, Record<string, string>> = {
  pl: {
    appTitle: "Kalendarz życia",
    appSubtitle:
      "Każdy kwadracik to jeden miesiąc. Koloruj okresy życia: nauka, praca, emerytura i inne.",
    maxAgeLabel: "Maksymalny wiek (lata)",
    birthYearLabel: "Rok urodzenia",
    birthMonthLabel: "Miesiąc urodzenia",
    languageLabel: "Język interfejsu",
    noValue: "Brak",
    currentAgeLabel: "Aktualny wiek",
    currentAgeSuffix: "lat (przybliżenie)",
    currentMonthInfo: "Czerwony obrys oznacza aktualny miesiąc życia.",
    exportPdf: "Eksportuj widok do PDF",
    resetAll: "Wyczyść dane",
    resetConfirm:
      "Czy na pewno chcesz usunąć wszystkie zaznaczenia i ustawienia?",
    legendTitle: "Legenda kategorii",
    monthShort: "mies.",
    yearLabel: "rok",
    hintClick: `
    <ul class="space-y-1 text-[11px] text-slate-500">
      <li>
        <strong>Malowanie życia:</strong> wybierz kategorię na pasku z kategoriami, a potem przeciągaj po kratkach, żeby zaznaczać miesiące. Pojedyncze kliknięcie kratki też działa.
      </li>
      <li>
        <strong>Notatki do pól:</strong> kliknij wybraną kratkę, żeby dodać tytuł, opis i oznaczyć ją jako ważny moment w panelu notatek.
      </li>
      <li>
        <strong>Wydarzenia w czasie:</strong> dodawaj wydarzenia (praca, nauka, dziecko, relacje, zdrowie, przeprowadzka, strata i inne). Mogą się na siebie nakładać – zobaczysz je jako kolorowe paski i ikonki.
      </li>
      <li>
        <strong>Kolory i ikonki wydarzeń:</strong> dla każdego wydarzenia możesz wybrać typ, kolor oraz ikonkę, które pojawią się zarówno na kratkach, jak i na osi czasu.
      </li>
      <li>
        <strong>Etapy życia:</strong> w szybkim konfiguratorze ustaw datę startu liceum, studiów, pracy i emerytury – siatka pokoloruje się automatycznie według tych etapów.
      </li>
      <li>
        <strong>Filtry widoku:</strong> ogranicz widok do wybranych kategorii albo przedziału wieku, żeby skupić się na konkretnym fragmencie życia.
      </li>
      <li>
        <strong>Oś czasu wydarzeń:</strong> na dole zobaczysz zagregowaną oś życia z paskami wydarzeń; możesz zmieniać jej powiększenie i przewijać ją poziomo, gdy zdarzeń jest więcej.
      </li>
      <li>
        <strong>Przewijanie siatki:</strong> jeśli siatka nie mieści się w pionie, użyj scrolla, żeby przeglądać kolejne lata bez utraty panelu z wydarzeniami i notatkami.
      </li>
      <li>
        Kliknij kratkę, a panel „Notatki” po prawej przełączy się w tryb edycji dla wybranego miesiąca.
      </li>
      <li>
        <strong>Dane tylko u Ciebie:</strong> wszystko zapisuje się automatycznie w Twojej przeglądarce. Na dole strony możesz wyeksportować widok do PDF albo całkowicie wyczyścić dane.
      </li>
    </ul>
    `,
    category_learning: "Nauka / edukacja",
    category_work: "Praca / kariera",
    category_retirement: "Emerytura",
    category_other: "Inne / pozostałe",
    category_none: "Brak (guma)",
    summaryTitle: "Podsumowanie",
    activeCategoryLabel: "Aktywna kategoria (malowanie)",
    quickConfigTitle: "Szybka konfiguracja etapów życia (opcjonalnie)",
    quickHighSchool: "Szkoła podstawowa/średnia",
    quickUniversity: "Studia",
    quickCareer: "Praca / kariera",
    quickRetirement: "Emerytura",
    quickFromAge: "Od roku życia",
    quickYears: "Lata trwania",
    quickRetirementFromAge: "Od roku życia (do końca jako emerytura)",
    quickApply: "Zastosuj konfigurator",
    quickHint:
      "Uzupełnij pola, żeby automatycznie pokolorować siatkę. Później możesz dostosować.",
    milestonesTitle: "Ważne momenty / notatki",
    milestonesHintSelect:
      "Kliknij kratkę w siatce, żeby dodać lub edytować notatkę dla danego miesiąca.",
    milestonesNoCell: "Najpierw kliknij kratkę, którą chcesz opisać.",
    milestonesPositionLabel: "Wybrany miesiąc",
    milestonesTitleLabel: "Tytuł",
    milestonesDescriptionLabel: "Opis (opcjonalnie)",
    milestonesSave: "Zapisz notatkę",
    milestonesDelete: "Usuń notatkę",
    milestonesSavedInfo:
      "Notatka zapisuje się lokalnie w tej przeglądarce (localStorage).",
    milestonesEditingLabel: "Edytujesz tę kratkę",
    filterCategoriesTitle: "Filtr kategorii",
    filterCategoriesShow: "Pokaż",
    filterAgeTitle: "Zakres wieku",
    filterAgeFrom: "Od roku",
    filterAgeTo: "Do roku",
        filterReset: "Wyczyść filtry",
        eventsTitle: "Wydarzenia w czasie (nakładające się)",
    eventsHint:
      "Dodaj okresy, które mogą na siebie nachodzić, np. równoległe studia i pracę. Te wydarzenia nakładają się na siatkę niezależnie od głównej kategorii kratki.",
    eventsAdd: "Dodaj wydarzenie",
    eventsEmpty:
      "Brak wydarzeń. Dodaj pierwsze, np. „Praca w firmie A”.",
    eventsTypeLabel: "Typ",
    eventsType_work: "Praca",
    eventsType_study: "Nauka",
    eventsType_other: "Inne",
    eventsTitleLabel: "Nazwa wydarzenia",
    eventsStartLabel: "Początek (rok/miesiąc)",
    eventsEndLabel: "Koniec (rok/miesiąc)",
    eventsOngoingLabel: "Trwa nadal",
    eventsNeedsBirthInfo:
      "Aby poprawnie nałożyć wydarzenia na siatkę, ustaw rok i miesiąc urodzenia.",
    eventsIconLabel: "Ikona",
    eventsColorLabel: "Kolor",
    eventsType_child: "Narodziny dziecka",
    eventsType_relationship: "Relacja / związek",
    eventsType_health: "Zdrowie / wypadek",
    eventsType_loss: "Śmierć / strata",
    eventsType_move: "Przeprowadzka / zmiana kraju",
    eventsTimelineTitle: "Podgląd na osi czasu",
    eventsTimelineEmpty:
      "Brak wydarzeń z pełnym zakresem dat do pokazania na osi czasu.",
  },

  en: {
    appTitle: "Life calendar",
    appSubtitle:
      "Each square is one month. Color periods of your life: learning, work, retirement and other.",
    maxAgeLabel: "Maximum age (years)",
    birthYearLabel: "Year of birth",
    birthMonthLabel: "Month of birth",
    languageLabel: "Interface language",
    noValue: "None",
    currentAgeLabel: "Current age",
    currentAgeSuffix: "years (approximate)",
    currentMonthInfo: "The red outline marks the current month of your life.",
    exportPdf: "Export view to PDF",
    resetAll: "Clear all data",
    resetConfirm:
      "Are you sure you want to delete all markings and settings?",
    legendTitle: "Category legend",
    monthShort: "mo.",
    yearLabel: "year",
    hintClick:
      "Pick a category below, then drag over the grid to paint. Single click works too.",
    category_learning: "Learning / education",
    category_work: "Work / career",
    category_retirement: "Retirement",
    category_other: "Other",
    category_none: "None (eraser)",
    summaryTitle: "Summary",
    activeCategoryLabel: "Active category (painting)",

    quickConfigTitle: "Quick life stages configurator (optional)",
    quickHighSchool: "High school",
    quickUniversity: "University",
    quickCareer: "Work / career",
    quickRetirement: "Retirement",
    quickFromAge: "From age (year of life)",
    quickYears: "Duration (years)",
    quickRetirementFromAge: "From age (rest as retirement)",
    quickApply: "Apply configurator",
    quickHint:
      "Fill in the fields, then click “Apply configurator” to auto-paint the grid. You can still adjust everything manually afterwards.",

    milestonesTitle: "Key moments / notes",
    milestonesHintSelect:
      "Click a square in the grid to add or edit a note for that month.",
    milestonesNoCell: "First click a square you want to describe.",
    milestonesPositionLabel: "Selected month",
    milestonesTitleLabel: "Title",
    milestonesDescriptionLabel: "Description (optional)",
    milestonesSave: "Save note",
    milestonesDelete: "Delete note",
    milestonesSavedInfo:
      "Notes are stored locally in this browser (localStorage).",

    filterCategoriesTitle: "Category filter",
    filterCategoriesShow: "Show",
    filterAgeTitle: "Age range",
    filterAgeFrom: "From year",
    filterAgeTo: "To year",
      filterReset: "Reset filters",
        eventsTitle: "Timeline events (overlapping)",
    eventsHint:
      "Add periods that can overlap, e.g. work and study at the same time. These events overlay the grid independently of the main cell category.",
    eventsAdd: "Add event",
    eventsEmpty:
      "No events yet. Add the first one, e.g. “Job at company A”.",
    eventsTypeLabel: "Type",
    eventsType_work: "Work",
    eventsType_study: "Study",
    eventsType_other: "Other",
    eventsTitleLabel: "Event name",
    eventsStartLabel: "Start (year/month)",
    eventsEndLabel: "End (year/month)",
    eventsOngoingLabel: "Ongoing",
    eventsNeedsBirthInfo:
      "To correctly map events onto the grid, set your year and month of birth.",
    eventsIconLabel: "Icon",
    eventsColorLabel: "Color",
    eventsType_child: "Child birth",
    eventsType_relationship: "Relationship",
    eventsType_health: "Health / accident",
    eventsType_loss: "Loss / death in family",
    eventsType_move: "Move / change of country",
    eventsTimelineTitle: "Timeline preview",
    eventsTimelineEmpty:
      "No events with a complete date range to show on the timeline yet.",

  },
};

export function getStrings(language: Language) {
  return STRINGS[language] ?? STRINGS.pl;
}
