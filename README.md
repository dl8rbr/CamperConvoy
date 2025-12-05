# 🚐 CamperConvoy

Eine moderne Web-Applikation zum Finden und Teilen von Camping- und Wohnmobil-Stellplätzen.

## 🚀 Features

- **Next.js 14** mit App Router
- **TailwindCSS** für modernes Styling
- **i18next** für Mehrsprachigkeit (Deutsch/Englisch)
- **Leaflet** für interaktive Karten
- **Simulierte Authentifizierung** (ohne Backend)

## 📁 Projektstruktur

```
CamperConvoy/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root Layout
│   │   ├── page.tsx            # Startseite
│   │   ├── globals.css         # Globale Styles & Tailwind
│   │   ├── map/
│   │   │   └── page.tsx        # Kartenansicht (Vollbild)
│   │   ├── spots/
│   │   │   └── page.tsx        # Stellplatz-Übersicht
│   │   ├── login/
│   │   │   └── page.tsx        # Login-Seite
│   │   ├── register/
│   │   │   └── page.tsx        # Registrierungsseite
│   │   └── favorites/
│   │       └── page.tsx        # Favoriten (Auth required)
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation
│   │   ├── Map.tsx             # Leaflet Kartenkomponente
│   │   ├── Providers.tsx       # Context Provider Wrapper
│   │   └── LanguageSwitcher.tsx # Sprachumschalter
│   ├── context/
│   │   └── AuthContext.tsx     # Auth State Management
│   └── lib/
│       └── i18n.ts             # i18next Konfiguration
├── public/                     # Statische Dateien
├── tailwind.config.ts          # Tailwind Konfiguration
├── postcss.config.js           # PostCSS Konfiguration
├── tsconfig.json               # TypeScript Konfiguration
├── next.config.js              # Next.js Konfiguration
└── package.json                # Abhängigkeiten
```

## 🛠️ Installation

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build

# Produktionsserver starten
npm start
```

## 🌐 Routen

| Route | Beschreibung |
|-------|-------------|
| `/` | Startseite mit Karte und Features |
| `/map` | Vollbild-Kartenansicht |
| `/spots` | Stellplatz-Übersicht mit Suche |
| `/login` | Anmeldeseite |
| `/register` | Registrierungsseite |
| `/favorites` | Favoriten (nur für angemeldete Benutzer) |

## 🔐 Demo-Authentifizierung

Die App verwendet eine simulierte Authentifizierung ohne Backend:

**Demo-Zugangsdaten:**
- Email: `demo@example.com`
- Passwort: `password`

Alternativ: Jede Email mit Passwort `demo` funktioniert ebenfalls.

## 🗺️ Karten-Integration

Die App verwendet **Leaflet** mit **react-leaflet** für die Kartenanzeige:

- OpenStreetMap als Tile-Provider
- Dynamischer Import (Client-Side only)
- Marker für Stellplätze mit Popups
- Benutzerstandort-Erkennung

## 🌍 Internationalisierung (i18n)

Unterstützte Sprachen:
- 🇩🇪 Deutsch (Standard)
- 🇬🇧 Englisch

Die Sprachauswahl wird automatisch im Browser gespeichert.

## 📦 Abhängigkeiten

### Produktionsabhängigkeiten
- `next` - React Framework
- `react` & `react-dom` - UI Library
- `i18next` & `react-i18next` - Internationalisierung
- `leaflet` & `react-leaflet` - Kartenintegration

### Entwicklungsabhängigkeiten
- `typescript` - Typisierung
- `tailwindcss` - CSS Framework
- `@types/leaflet` - Leaflet Typen

## 🎨 Styling

Das Projekt verwendet TailwindCSS mit benutzerdefinierten:
- **Farbpalette** (primary/secondary)
- **Komponenten-Klassen** (.btn-primary, .card, .input-field)
- **Dark Mode** Unterstützung

## 📝 Nächste Schritte

- [ ] Backend-Integration (z.B. mit Supabase/Firebase)
- [ ] Echte Benutzer-Authentifizierung
- [ ] Stellplatz-Datenbank
- [ ] Bewertungssystem
- [ ] Bildupload für Stellplätze
- [ ] PWA-Funktionalität

## 📄 Lizenz

MIT License


