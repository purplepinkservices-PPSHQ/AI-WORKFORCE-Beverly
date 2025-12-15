# 🟣 AI-WORKFORCE-Beverly

**Beverly** ist ein modularer, KI-gestützter Discord-Assistent für  
📁 Dokumentenmanagement · 🧠 Projekt- & Memory-Tracking · 📊 Task- & Kontextsteuerung  
mit enger Anbindung an **Notion**, **Dropbox** und zukünftige KI-Module.

Dieses Repository enthält den **stabilen Core (Phase A + B)** von Beverly.

## 🚀 Status

✅ **Phase A – Stabil**

- Discord Bot Core
- DM-Routing
- Auto-Memory (Notion)
- Manuelle Snapshots (`snapshot`, `abend`)
- Dropbox-Initialisierung

✅ **Phase B – Aktiv**

- Projekt-Memory-Datenbank (Notion)
- Property-Inspector
- Saubere Property-Writes
- Supervisor-Grundlogik

⏳ **Phase C – in Vorbereitung**

- Task Engine Sync
- Kontext-Routing
- Supervisor Automationen

## 🧠 Kernfunktionen

### 📩 Discord

- Vollständiger **DM-Workflow**
- Command-Handling:
  - `snapshot` → Projekt-Snapshot
  - `abend` → Tagesabschluss
  - `menu` → Creator-Menü
- Debug-Logging für alle Events

### 🧠 Notion

- **Task Engine (Read)**
- **Project Memory Database (Write)**
- Automatische Property-Erkennung
- Stabiler Write-Flow (keine Validation Errors)

### 📁 Dropbox

- Automatische Initialisierung der Beverly-Ordnerstruktur
- Wiederanlaufsicher (existierende Ordner werden erkannt)

## 📂 Projektstruktur

src/
├─ bot/ → Discord Bot (index.js)
├─ system/ → Router, Task Queue
├─ memory/ → Memory Engine (Discord → Notion)
├─ notion/ → Notion Client + DB Logic
├─ cloud/ → Dropbox Integration
├─ creator/ → Creator & Verification Flows
├─ finance/ → Haushalts- & Finanzlogik
└─ core/ → Globaler State

## ⚙️ Installation

### 1️⃣ Repository klonen

git clone https://github.com/purplepinkservices-PPSHQ/larry-assistant-bot.git
cd larry-assistant-bot

2️⃣ Abhängigkeiten installieren

npm install

3️⃣ .env anlegen
env

DISCORD_BOT_TOKEN=xxxxxxxx
NOTION_API_KEY=secret_xxxxxxxx
PROJECT_MEMORY_DB_ID=xxxxxxxx
TASK_ENGINE_DB_ID=xxxxxxxx
DROPBOX_ACCESS_TOKEN=xxxxxxxx

4️⃣ Bot starten
bash
Code kopieren
npm start

🧪 Teststatus
Beim Start müssen folgende Logs erscheinen:

📁 Dropbox bereit.
📊 Task Engine Treffer: 1
🧠 Memory Snapshot erfolgreich geschrieben.
📩 messageCreate FIRED …

Wenn das der Fall ist → System stabil ✅

🧭 Architektur-Prinzipien

Keine Snippets – immer vollständige Dateien

Kein Blind-Write – Property-Inspection vor Writes

Nicht blockierend – Auto-Memory läuft async

Supervisor-fähig – vorbereitet für Automationen

🛣️ Roadmap (Kurz)

Phase C: Task Engine Write

Phase D: Kontext-Matching

Phase E: Supervisor Scheduler

Phase F: Railway Deployment

Phase G: Multi-User Testbetrieb

🟣 Lizenz
Internes Projekt von PPSHQ – Purple Pink Services
Alle Rechte vorbehalten.




