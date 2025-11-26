# Larry Assistant Bot 🧠⚡  
**Ein KI-gestützter Dokumenten-, Finanz- und Versicherungs-Assistent**  
**by Larry Adler (PPSHQ)**  
**Version 1.0**

---

## 📌 Projektübersicht

Der **Larry Assistant Bot** ist ein hochmoderner, lokal betriebener KI-Assistent zur automatischen Verarbeitung, Analyse und Verwaltung von:

- Dokumenten  
- Schulden  
- Versicherungen  
- Behördenunterlagen  
- persönlichen Stammdaten  
- automatischen Briefen  
- Fristen & Prioritäten

Der Bot dient als **digitaler persönlicher Assistent**, der über Discord gesteuert wird, lokal auf dem PC läuft und Daten sicher in die Cloud schreibt.

Ziel:  
**Millionen Menschen von Papierkram, Stress, Schuldenchaos & Behördenüberlastung befreien.**

---

## ✨ Key Features (Aktuelle Version – 1.0)

### 📥 Automatische Dokumentenerkennung
- Upload via Discord  
- OCR (lokal)  
- KI-Analyse (lokal oder Cloud-Fallback)  
- Automatische Extraktion:  
  - Gläubiger  
  - Betrag  
  - Frist  
  - Kategorie  
  - Aktenzeichen  
  - Versicherungsdaten

### 🗂️ Vollautomatische Sortierung
Ordnerstrukturen in Google Drive:

/Larry
/Schuldner
/Finanzamt
/Gerichtsvollzieher
/Ärzte
/Behörden
/UG
/Sonstiges
/Versicherungen
/Haftpflicht
/Hausrat
/Rechtsschutz
/Krankenversicherung
/BU
/KFZ
/Wohngebäude
/Sonstiges
/Master-Daten


### 🧾 Master-Profil
Bot fragt beim ersten Start alle relevanten Lebensdaten ab:

- Name, Adresse, Steuer-ID  
- Kinder  
- Haustiere  
- Auto  
- Haus/Eigentum  
- Versicherungen  
- Gesundheitsstatus  
- Gewerbe  
- u. v. m.

→ Wird gespeichert und **für alle Briefe** automatisch genutzt.

### ⚠️ Priorisierung
- 🔴 CRITICAL (Vollstreckung)  
- 🟡 MEDIUM (Mahnung)  
- 🟢 LOW (Info)

### 📨 Automatische Schreiben
Der Bot generiert professionelle, vollständige Briefe:

- Ratenzahlungsanträge  
- Stundungsanträge  
- Fristverlängerungen  
- Härtefallanträge  
- Versicherungs-Kündigungen  
- Behördenantworten

Alles vollautomatisch mit deinen Stammdaten.

### 🧠 Lokaler KI-Modus
Der Bot ist so gebaut, dass er **lokale KI-Instanzen** unterstützt:

- Llama 3  
- Qwen  
- Mixtral  
- GPT4All  
- oder eigene Custom-Modelle  

→ Optional Cloud-Fallback.

---

## 🏗️ Tech Stack

- Node.js  
- discord.js  
- Express  
- Tesseract OCR (lokal)  
- Google Drive API  
- Google Sheets &/oder SQLite  
- Lokale KI-Schnittstellen  
- Cloud-KI-Fallback  

---

## 📁 Projektstruktur

larry-assistant-bot/
│
├── README.md
├── INSTALL.md
├── DEVELOPERS.md
├── CHANGELOG.md
├── CONTRIBUTING.md
│
├── .github/
│ ├── ISSUE_TEMPLATE/
│ │ ├── bug_report.md
│ │ ├── feature_request.md
│ └── pull_request_template.md
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


---

## 🚀 Roadmap

### ✔️ Version 1.0
- Dokumentenpipeline  
- Versicherungsmodul  
- Master-Profil  
- Lokaler Betrieb  
- Cloud Drive Integration  

### 🔜 Version 1.5
- PDF-Briefe  
- Kalenderintegration  
- Vollständiger Versicherungscheck  

### 🔜 Version 2.0
- Web Dashboard  
- Multi-User  
- Automatische Behörden-Formulare  
- KI-Agenten  

---

## 📄 Lizenz
© 2025 — Larry Adler (PPSHQ)  
Alle Rechte vorbehalten.

---



