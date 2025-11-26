\# INSTALL.md  

\*\*Installations- \& Setup-Anleitung für den Larry Assistant Bot\*\*  

Version 1.0



---



\# ⚙️ Inhalt



1\. Voraussetzungen  

2\. Projekt herunterladen / Klonen  

3\. Node.js installieren  

4\. Abhängigkeiten installieren  

5\. Discord Bot erstellen  

6\. Google Drive API einrichten  

7\. Umgebungsvariablen einrichten (.env)  

8\. Lokalen KI-Server vorbereiten  

9\. Bot starten  

10\. Erste Nutzung \& Master-Profil-Setup  

11\. Fehlerbehebung / Troubleshooting  



---



\# 1️⃣ Voraussetzungen



Bevor du den Bot starten kannst, benötigst du:



\- Windows 10 oder 11  

\- Node.js (LTS Version)  

\- Git  

\- Discord Account  

\- Google Account (für Drive)  

\- Optional: lokale KI-Modelle (Llama, Qwen, Mixtral etc.)



Empfohlene Hardware:

\- 16 GB RAM  

\- 4+ CPU Kerne  

\- SSD  



---



\# 2️⃣ Projekt herunterladen / Klonen



Wenn das Projekt bereits als lokaler Ordner existiert, kannst du diesen Schritt überspringen.



Klonen (falls GitHub verwendet wird):



```bash

git clone https://github.com/DEINNAME/larry-assistant-bot.git

cd larry-assistant-bot

3️⃣ Node.js installieren



1. https://nodejs.org besuchen

2\. LTS Version herunterladen

3\. Installieren

4\. Test im Terminal:

node -v

npm -v


4️⃣ Abhängigkeiten installieren



Im Projektordner:

npm install


5️⃣ Discord Bot erstellen



1. https://discord.com/developers/applications

2\. „New Application“ → Name: Larry Assistant Bot

3\. Menü links → Bot

4\. „Add Bot“

5\. Token kopieren → später in .env eintragen



Bot-Einstellungen aktivieren:



* Message Content Intent
* Server Members Intent
* Presence Intent



Bot einladen:



1. OAuth2 → URL Generator

2\. Scopes: bot

3\. Permissions: Send Messages, Read Message History, Attach Files

4\. Link öffnen → Bot auf eigenen Server einladen

6️⃣ Google Drive API einrichten



1. https://console.cloud.google.com öffnen

2\. Neues Projekt erstellen (z. B. „Larry-Assistant“)

3\. „APIs \& Services“ → „Enable APIs“

4\. „Google Drive API“ aktivieren

5\. „Credentials“ → „Create Service Account“

6\. Einen Key erstellen

7\. JSON-Datei herunterladen

8\. Speichern in: /data/google-service-account.json
9. Google Drive Ordner anlegen

10\. Ordner-ID kopieren

11\. In .env eintragen


7️⃣ .env Datei anlegen



Im Projektordner larry-assistant-bot/ eine Datei .env erstellen:

BOT\_TOKEN=DEIN\_DISCORD\_BOT\_TOKEN

DRIVE\_FOLDER\_ID=DEINE\_DRIVE\_ORDNER\_ID

GOOGLE\_SERVICE\_ACCOUNT\_PATH=./data/google-service-account.json

DATABASE\_PATH=./data/database.sqlite

LOCAL\_AI\_URL=http://localhost:5005

PORT=3000


8️⃣ Lokalen KI-Server vorbereiten (optional)

LM Studio (einfachste Variante)



1. https://lmstudio.ai herunterladen

2\. Modell laden (z. B. Llama 3)

3\. Server starten

4\. KI ist erreichbar unter: http://localhost:1234/v1/chat/completions

5\. In .env anpassen: LOCAL\_AI\_URL=http://localhost:1234/v1/chat/completions


→ Der Bot nutzt automatisch die lokale KI, wenn erreichbar.

9️⃣ Bot starten



Im Terminal:

node src/bot/index.js


Wenn alles korrekt ist, erscheint:

\[INFO] Larry Assistant Bot gestartet...

\[INFO] Verbunden mit Discord.

\[INFO] OCR bereit.

\[INFO] Google Drive verbunden.


🔟 Erste Nutzung – Master-Profil-Setup



In Discord:

/setup


Der Bot fragt:



* Name
* Adresse
* Steuer-ID
* Telefonnummer
* Lebenssituation
* Haustiere
* Auto
* Haus/Eigentum
* Versicherungen
* Gesundheitsstatus
* Kinder



Der Bot speichert die Daten in:

/data/master-profile.json


Zusätzlich erstellt er eine PDF:

/Larry/Master-Daten/master-profile.pdf


1️⃣1️⃣ Troubleshooting

❗ Bot startet nicht



* .env fehlt
* Node Version veraltet
* Ordnerstruktur fehlt



❗ Bot reagiert nicht im Discord



* Token falsch
* Message Content Intent nicht aktiv
* Bot nicht richtig eingeladen



❗ Google Drive Fehler



* Falscher Service Account
* Zugriffsrechte fehlen
* JSON nicht gefunden



❗ Lokale KI funktioniert nicht



* Server nicht gestartet
* Port falsch
* Modell nicht geladen



✔️ Installation abgeschlossen



Der Larry Assistant Bot ist jetzt bereit für:



* Dokumenten-Uploads
* Versicherungsanalyse
* automatische Schreiben
* KI-Auswertung
* vollständige Cloud-Integration





