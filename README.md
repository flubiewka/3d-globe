# 🌍 My Travel Globe 3D

Projekt interaktywnego globusa 3D, który pozwala śledzić Twoje podróże. Aplikacja nie tylko stawia kropki na mapie, ale automatycznie pobiera dane geograficzne i pogodowe dla każdego dodanego miejsca.

## 🚀 Jak to działa? (Logika systemu)
Aplikacja to połączenie trzech różnych technologii, które współpracują ze sobą w czasie rzeczywistym:

* **Frontend (Three.js):** Odpowiada za całą warstwę wizualną. Generuje model 3D Ziemi, obsługuje interaktywną kamerę oraz system Raycaster, który pozwala "wyczuć" kliknięcie w konkretny punkt na sferze.
* **Backend (PHP):** Działa jako mózg operacyjny. Zarządza bazą danych MySQL, odbiera zapytania od użytkownika i uruchamia skrypty pomocnicze na serwerze.
* **Warstwa logiki (Python):** Wykorzystuje bibliotekę geopy do tzw. geokodowania. Zamienia wpisaną przez Ciebie nazwę miasta na dokładne współrzędne (szerokość i długość geograficzną) oraz pobiera aktualne dane o pogodzie przez API OpenWeatherMap.

## 🛠 Funkcje aplikacji
Aplikacja została zaprojektowana z myślą o wygodzie użytkownika i przejrzystości danych:

* **Interaktywny Globus:** Możliwość swobodnego obracania i przybliżania modelu Ziemi.
* **Dodawanie miast:** System automatycznie rozpoznaje lokalizację i przypisuje kod kraju oraz flagę.
* **Statusy podróży:** Wizualne rozróżnienie miejsc na "Odwiedzone" (zielone) i "Planowane" (czerwone).
* **Pogoda Live:** Automatyczne pobieranie temperatury i opisu aury (np. "clear sky", "light rain") w momencie dodawania punktu.
* **Dynamiczny Panel Info:** Po kliknięciu w punkt na globusie wyświetlają się szczegółowe współrzędne i dane pogodowe.
* **Zarządzanie listą:** Możliwość szybkiego usuwania wpisów oraz podgląd wszystkich miejsc w formie sortowalnej tabeli.

## ⚙️ Instrukcja instalacji i konfiguracja

Aby uruchomić projekt lokalnie, wykonaj poniższe kroki:

### 1. Baza danych
* Zaimportuj dołączony plik database.sql do swojego serwera MySQL (np. przez phpMyAdmin).
* Otwórz plik includes/db.php i wpisz swoje dane logowania do bazy (host, użytkownik, hasło, nazwa bazy).

### 2. Środowisko Python
Projekt wymaga zainstalowanego Pythona 3.x oraz zewnętrznych bibliotek. Otwórz terminal w folderze projektu i wpisz:
pip install geopy requests

### 3. Klucz API
Utwórz nowy plik o nazwie .env w głównym katalogu projektu i wklej w nim swój klucz z OpenWeatherMap:
WEATHER_API_KEY=twoj_klucz_api_tutaj

### 4. Uruchomienie
* Umieść folder z projektem na serwerze lokalnym (np. w folderze htdocs w XAMPP).
* Otwórz przeglądarkę i wejdź pod adres localhost/nazwa-folderu.

## 📂 Struktura plików
* api/ — Logika backendu. Tutaj znajdują się endpointy PHP oraz skrypt Python.
* assets/js/ — Pliki JavaScript. Główna logika Three.js oraz funkcje komunikacji.
* includes/ — Pliki konfiguracyjne, w tym skrypt łączący z bazą danych (db.php).
* index.php — Główny plik widoku, ładujący mapę 3D i interfejs.

## 🔒 Bezpieczeństwo i Jakość kodu
* SQL Injection: Wszystkie operacje na bazie danych wykorzystują Prepared Statements.
* Command Injection: Dane przekazywane do skryptu Python są filtrowane funkcją escapeshellarg.
* Obsługa błędów: Aplikacja przechwytuje wyjątki (np. brak miasta, błąd API) i wyświetla czytelne komunikaty.