# Beverly – Free 1.0  
**Alltags-Assistenz & Dokumenten-Intelligenz**


## Überblick

**Beverly Free 1.0** ist eine produktive, lokal betriebene Dokumenten-Assistenz.  
Sie nimmt Dateien über Discord entgegen, liest Inhalte per KI, erkennt Dokumentarten, extrahiert Kerndaten und legt alles **automatisch & strukturiert** in Dropbox ab.

Ziel: **Ordnung, Sicherheit und Zeitgewinn** – ohne manuelle Sortierung.


## Aktueller Status

- ✅ Stabiler Discord-Upload-Flow
- ✅ OCR für Bilder & Scan-PDFs
- ✅ KI-basierte Dokumentenanalyse (OpenAI)
- ✅ Automatische Dateibenennung
- ✅ Automatische Ordnerstruktur in Dropbox
- ✅ Fehler- & Fallback-Logik
- 🔒 Private-Mode (keine öffentliche Freigabe)

**Status:** Beverly Free **produktiv lauffähig (1.0)**


## Funktionsumfang (Free)

### Upload
- Upload über Discord-DM
- Unterstützt:
  - JPG / PNG / WEBP
  - PDF (Text & Scan)

### Analyse (KI)
Beverly erkennt u. a.:

- Dokumenttyp (Rechnung, Mahnung, Vertrag, Bescheid, Versicherung, Arzt, Bank, Behörde …)
- Datum
- Gläubiger / Absender
- Zugeordnete Person (User / Haushalt)
- Kategorie

### Dateiname (automatisch)

YYYY-MM-DD_TYP_GLAEUBIGER_PERSON.ext


Beispiel:
2025-12-18_Rechnung_Zahnarzt_Maxi.pdf


### Ablagestruktur (Dropbox)

/YYYY/KATEGORIE/MONAT/YYYY-MM-DD_TYP_GLAEUBIGER_PERSON.ext


Beispiel:
/2025/Gesundheit/Dezember/2025-12-18_Rechnung_Zahnarzt_Maxi.pdf


## Technischer Stack

- Node.js
- Discord.js
- OpenAI API (Text & Vision)
- Dropbox API
- Axios
- Lokale Ordnerstruktur
- Modularer Engine-Aufbau


## Projektstruktur (relevant)

src/
├─ bot/ # Discord Bot Einstieg
├─ free/ # Free Beverly Flow
├─ orchestrator/ # Analyse-Koordination
├─ engines/ # Fachlogik (Datum, Typ, Person, Gläubiger)
├─ keywords/ # Keyword-Indizes
├─ utils/ # OCR, Dropbox, PDF Handling
├─ system/ # Router & State
└─ private/ # Erweiterungen (nicht aktiv)


## Entwicklungsphilosophie

- **Stabilität vor Features**
- **Keine Magie, klare Logik**
- **Alles nachvollziehbar**
- **Erweiterbar ohne Rewrite**

Beverly ist kein Experiment – sie ist ein **System**.

## Roadmap (nächste Schritte)

- Feintuning der Erkennungslogik
- Mehr Kategorien & Keywords
- Pro-Features (History, Suche, Regeln)
- Multi-User-Haushalte
- Vollständige UI-Anbindung

## Hinweis

Dieses Repository bildet den Stand **Beverly Free 1.0** ab.  
Weitere Module (Pro, Business, Private) werden **separat** entwickelt.


**Beverly ordnet dein Leben.**