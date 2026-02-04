# 3D Travel Globe & Weather Tracker

**Interaktywna aplikacja internetowa do wizualizacji historii podróży z wykorzystaniem grafiki 3D i danych pogodowych w czasie rzeczywistym.**

## 📖 Opis projektu

Niniejszy projekt to aplikacja typu Full-Stack, która umożliwia użytkownikowi prowadzenie ewidencji odwiedzonych miast oraz planowanych wyjazdów. Kluczową cechą systemu jest wizualizacja danych na interaktywnym globusie 3D (WebGL) oraz w formie kinowej osi czasu (Timeline).

Aplikacja automatycznie określa współrzędne geograficzne miast, pobiera aktualne dane pogodowe i zapisuje historię podróży w bazie danych.

---

## 🚀 Główna funkcjonalność

### 1. Globus 3D (Globe View)
* **Technologia:** Three.js.
* **Opis:** Interaktywny model Ziemi z atmosferą, gwiazdami, Słońcem i Księżycem.
* **Znaczniki:** Odwiedzone i planowane miasta są wyświetlane jako punkty na powierzchni sfery (konwersja Lat/Lng na współrzędne 3D Vector3).
* **Interfejs:** Panele w stylu Glassmorphism służące do dodawania miast i podglądu pogody.

### 2. Kinowa Oś Czasu (Timeline Animation)
* **Wizualizacja:** Liniowa podróż kamery przez przestrzeń gwiezdną od miasta do miasta.
* **Efekty:** Zaimplementowano Post-processing (UnrealBloomPass) w celu uzyskania efektu neonowej poświaty obiektów i połączeń między nimi.
* **Logika:** Asynchroniczne ładowanie flag państw i generowanie tekstur dla etykiet za pomocą API HTML5 Canvas.

### 3. Baza danych i zarządzanie (Database View)
* **Tabela:** Pełna lista lokalizacji z funkcją filtrowania i wyszukiwania.
* **CRUD:** Dodawanie, usuwanie oraz masowa aktualizacja danych pogodowych.

### 4. Backend i API
* **PHP:** Obsługa żądań frontendowych, komunikacja z bazą danych.
* **Python:** Wykorzystywany jako mikroserwis do geokodowania (uzyskiwanie współrzędnych na podstawie nazwy miasta) przy użyciu biblioteki `geopy` oraz do wstępnego pobierania danych pogodowych.
* **Integracje:**
    * *OpenWeatherMap API* — bieżąca pogoda.
    * *Nominatim (OSM)* — geokodowanie.
    * *FlagCDN* — obrazy flag państwowych.

---

## 🛠 Stos technologiczny (Tech Stack)

### Frontend
* **HTML5 / CSS3** (Custom Properties, Flexbox, CSS Grid).
* **JavaScript (ES6+)** — architektura modułowa (`type="module"`).
* **Three.js** — renderowanie 3D, zarządzanie kamerą, shadery.

### Backend
* **PHP 8.x** — logika serwerowa.
* **MySQL (MariaDB)** — przechowywanie danych (`visited_places`).
* **Python 3.x** — skrypt pomocniczy do pracy z danymi geograficznymi.