\# DEVELOPERS.md  

\*\*Entwicklerdokumentation – Larry Assistant Bot\*\*  

Version 1.0


\# 📚 Inhalt


1\. Architekturübersicht  
2\. Verzeichnisstruktur  
3\. Hauptkomponenten  
4\. Datenmodelle  
5\. API-Endpunkte  
6\. KI-Schicht  
7\. OCR-Schicht  
8\. Storage-System  
9\. Ereignisfluss (Event Flow)  
10\. Entwicklungs-Workflow (Git)  
11\. Coding Guidelines  


\# 1️⃣ Architekturübersicht


Der Larry Assistant Bot besteht aus vier zentralen Schichten:


\### 1. Discord Layer

Steuert:

\- Uploads
\- Befehle
\- Statusmeldungen
\- Interaktionen mit dem User


Framework:  

`discord.js`



\### 2. Backend Layer (lokal)

\- Node.js + Express
\- OCR-Verarbeitung
\- KI-Anfragen
\- Datenextraktion
\- Schreiben generieren


\### 3. KI-Schicht

Zwei Modi:

\- \*\*lokal\*\* → bevorzugt (Llama/Qwen/Mixtral/LM Studio)  
\- \*\*cloud\*\* → fallback



Die KI-Schicht extrahiert:

\- Gläubiger  
\- Betrag  
\- Fristen  
\- Versicherungsdetails  
\- Dokumentart  
\- Priorität  
\- Empfehlungen  


\### 4. Storage Layer

\- Google Drive (Dokumente)  
\- Google Sheets oder SQLite (Strukturierte Daten)  
\- JSON (Master-Profil)



\# 2️⃣ Verzeichnisstruktur



larry-assistant-bot/

│

├── README.md

├── INSTALL.md

├── DEVELOPERS.md

├── CHANGELOG.md

├── CONTRIBUTING.md

│

├── .github/

│ ├── ISSUE\_TEMPLATE/

│ │ ├── bug\_report.md

│ │ ├── feature\_request.md

│ └── pull\_request\_template.md

│

├── src/

│ ├── bot/

│ │ ├── index.js

│ │ ├── commands/

│ │ ├── events/

│ │ └── utils/

│ │

│ ├── ai/

│ │ ├── local/

│ │ ├── cloud/

│ │ └── prompts/

│ │

│ ├── ocr/

│ │ └── ocr-engine.js

│ │

│ ├── storage/

│ │ ├── google-drive.js

│ │ ├── database.js

│ │ └── structure.json

│

├── data/

│ ├── master-profile.json

│ ├── logs/

│ └── temp/

│

└── package.json



\# 3️⃣ Hauptkomponenten



\## 3.1 Bot Entry Point – `src/bot/index.js`

Funktionen:

\- Discord Login  
\- Event-Handler registrieren  
\- Upload Listener  
\- Slash-Commands laden  
\- Analyse-Pipeline starten  



\## 3.2 Event Handler – `src/bot/events/\*`

\- `messageCreate.js`  

&nbsp; → Startet OCR + KI + Speicherung  

\- `interactionCreate.js`  

&nbsp; → Bot-Kommandos `/setup`, `/status`, `/letter`  



\## 3.3 Commands – `src/bot/commands/\*`

\- `/setup` → Master-Profil  
\- `/status` → Letzte Dokumente  
\- `/letter` → Schreiben generieren  



\# 4️⃣ Datenmodelle



\## 4.1 Dokumentmodell (Database)


documents {

id: string

file\_url: string

drive\_url: string

creditor: string

amount: number

deadline: string

category: string

priority: string

status: string

metadata: json

created\_at: date

updated\_at: date

}



\## 4.2 Master-Profil – `master-profile.json`


{

"name": "",

"address": "",

"birthdate": "",

"steuer\_id": "",

"phone": "",

"family\_status": "",

"children": "",

"pets": "",

"car": "",

"house": "",

"insurances": {},

"health\_status": "",

"business\_owner": false

}


\# 5️⃣ API-Endpunkte



Backend läuft auf lokalem PORT aus `.env`.



\### 5.1 `/analyze-document` (POST)

Beschreibung:  

OCR + AI-Auswertung eines Dokuments.



Input:


{

"filePath": "/temp/file.pdf"

}



Output:


{

"creditor": "...",

"amount": 123.45,

"deadline": "2025-12-14",

"category": "Finanzamt",

"priority": "CRITICAL",

"details": {...}

}



\### 5.2 `/generate-letter` (POST)

Generiert ein Schreiben basierend auf:

\- Dokumentdaten

\- Masterprofil

\- Schreibtyp



Input:


{

"documentId": "123",

"type": "ratenzahlung"

}



Output:


{

"letter": "Sehr geehrte Damen und Herren..."

}



\### 5.3 `/classify-insurance` (POST)

Analysiert Versicherungsdokumente.


\# 6️⃣ KI-Schicht



Ordner: `src/ai/`



\## 6.1 Lokale KI (`ai/local/\*`)

\- Standardendpunkt: `LOCAL\_AI\_URL`  
\- Formatiert Anfragen als Chat-Completion  
\- Nutzt lokale Modelle für Datenschutz \& Geschwindigkeit  


\## 6.2 Cloud-KI (`ai/cloud/\*`)

\- Nur Fallback  
\- Modellagnostisch  
\- Gleiche Prompt-Strukturen  


\## 6.3 Prompts (`ai/prompts/\*`)

\- insurance.prompt  
\- document.prompt  
\- category.prompt  
\- letter.prompt  




\# 7️⃣ OCR-Schicht



Ordner: `src/ocr/ocr-engine.js`



Verwendung:

\- Tesseract lokal (Standard)  
\- Optional: Google Vision  



Output:

\- reiner Text  
\- JSON mit extrahierten Blöcken  



\# 8️⃣ Storage-System



\## 8.1 Google Drive – `google-drive.js`

Funktionen:

\- Datei hochladen  
\- Ordnerstruktur automatisch anlegen  
\- Download-Links erzeugen  



\## 8.2 Datenbank – `database.js`

Unterstützt:

\- SQLite  
\- Google Sheets (optional)  



Features:

\- Insert  
\- Update  
\- Query Last 10 Documents  
\- Search by Aktenzeichen  



\## 8.3 Strukturdatei – `structure.json`

Beschreibt:

\- Kategorien  
\- Versicherungsarten  
\- Ordnerpfade  




\# 9️⃣ Ereignisfluss (Event Flow)



\### \*\*Upload in Discord → Vollständige Pipeline\*\*



messageCreate (Attachment)

↓

OCR Engine

↓

KI-Auswertung

↓

Kategorie-Zuweisung

↓

Priorität bestimmen

↓

Drive Upload

↓

Datenbank speichern

↓

Antwort im Discord




\# 🔟 Entwicklungs-Workflow (Git)



\## Branches

\- `main` → stabile Releases  
\- `dev` → aktive Entwicklung  
\- `feature/\*` → neue Features  
\- `hotfix/\*` → Bugfixes  



\## PR Flow

1\. Branch erstellen  
2\. Commit  
3\. Push  
4\. Pull Request  
5\. Review  
6\. Merge  



\## Versionierung

SemVer:

\- MAJOR.MINOR.PATCH  
\- 1.0.0 → Erstes Release  



\# 1️⃣1️⃣ Coding Guidelines



\### Allgemein

\- keine Hardcoded Paths  
\- alles aus `.env` laden  
\- Fehler sauber loggen  



\### Struktur

\- Jede Funktion kurz  
\- Events schlank halten  
\- AI-Prompts sauber dokumentieren  
\- Keine Logik im Bot-File → Services nutzen  



\### Logging

Speichern in:

/data/logs/



\### Fehlerhandling

\- try/catch Pflicht  
\- Discord Fehler nicht an User senden  
\- OCR-Fehler per Log protokollieren  




