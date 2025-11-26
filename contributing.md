\# CONTRIBUTING.md  

\*\*Beitrag-Richtlinien für den Larry Assistant Bot\*\*  

Version 1.0



Danke für dein Interesse an der Weiterentwicklung des \*\*Larry Assistant Bot\*\*!  

Dieses Dokument beschreibt die Regeln und Prozesse für Beiträge, Änderungen, Reviews und Releases.



---



\# 📚 Inhalt



1\. Voraussetzungen  

2\. Grundprinzipien  

3\. Git-Workflow  

4\. Branch-Naming  

5\. Commit-Richtlinien  

6\. Pull Requests  

7\. Code Style Guidelines  

8\. Tests \& Qualität  

9\. Dokumentationsregeln  

10\. Release-Prozess  



---



\# 1️⃣ Voraussetzungen



Bevor du beitragen kannst, benötigst du:



\- Git  

\- Node.js  

\- Discord Dev Account  

\- Optional: Zugang zu Google Drive API Keys  

\- Verständnis der Projektarchitektur (siehe DEVELOPERS.md)



---



\# 2️⃣ Grundprinzipien



\- Sauberer, gut strukturierter Code  

\- Keine sensiblen Daten im Repo  

\- Einfachheit vor Komplexität  

\- Jede Funktion sollte nur eine Sache tun  

\- KI-Prompts müssen wiederholbar und dokumentiert sein  

\- Lokale KI bevorzugt, Cloud nur als Fallback  



---



\# 3️⃣ Git-Workflow



Alle neuen Features und Fixes gehen \*\*nie direkt in `main`\*\*, sondern folgen diesem Prozess:



main → dev → feature/\* → Pull Request → Merge



Branches:

\- `main` → stabile Releases  

\- `dev` → aktueller Entwicklungsstand  

\- `feature/\*` → neue Features  

\- `hotfix/\*` → dringende Fehlerbehebungen  



Beispiele:


feature/insurance-parser

feature/calendar-sync

hotfix/ocr-crash-when-empty



---



\# 4️⃣ Branch-Naming



Verwende folgende Formate:



\- `feature/<beschreibung>`  

\- `hotfix/<beschreibung>`  

\- `chore/<beschreibung>` (Aufräumarbeiten)  

\- `docs/<beschreibung>` (Dokumentation)  



Beispiele:


docs/add-api-docs

feature/add-pdf-export

hotfix/fix-null-deadline

chore/refactor-storage-layer



---



\# 5️⃣ Commit-Richtlinien



Commits sollten kurz und präzise sein.



Format:


<type>: <kurze beschreibung>



Typen:

\- `feat:` → neues Feature  

\- `fix:` → Bugfix  

\- `docs:` → Dokumentation  

\- `refactor:` → Code-Verbesserung  

\- `perf:` → Performance  

\- `chore:` → Setup/Config/Package  



Beispiele:


feat: add insurance document classifier

fix: resolve crash on empty OCR result

docs: update installation instructions

refactor: improve ai provider interface



---



\# 6️⃣ Pull Requests



Ein Pull Request muss enthalten:



1\. \*\*Was wurde geändert?\*\*  

2\. \*\*Warum wurde es geändert?\*\*  

3\. \*\*Wie wurde getestet?\*\*  

4\. \*\*Breaking Changes?\*\*  

5\. \*\*Screenshots / Logs (wenn sinnvoll)\*\*  



PRs dürfen \*\*nicht gemergt werden\*\*, bevor:



\- alle Checks erfolgreich sind  

\- mindestens 1 Review erfolgt ist  

\- keine offenen Fragen bleiben  



---



\# 7️⃣ Code Style Guidelines



\- Keine Hardcoded Strings → `.env` oder `config`  

\- Keine Logik in `index.js` → Nur Routing/Events  

\- Services in `src/...` sauber trennen  

\- Variablen klar benennen  

\- KI-Prompts klar getrennt speichern  

\- Kommentare nur wenn nötig  

\- Fehler immer mit `try/catch` abfangen  



---



\# 8️⃣ Tests \& Qualität



Derzeit einfache Teststrategie:



\- Manuelle Tests in Discord  

\- Konsolen-Logs prüfen  

\- OCR Ergebnisse testen  

\- Google Drive Uploads testen  

\- Lokale KI testen (falls verfügbar)



Zukünftig (V2+):



\- Unit Tests  

\- Integrationstests  

\- Mocked OCR Tests  



---



\# 9️⃣ Dokumentationsregeln



Jede Codeänderung muss dokumentiert werden:



\- Neue Dateien → README erweitern  

\- API-Änderungen → DEVELOPERS.md aktualisieren  

\- Features → CHANGELOG.md aktualisieren  

\- Neue Befehle → Slash Commands Dokumentation ergänzen  



Dokumentation ist \*\*Pflicht\*\*, nicht optional.



---



\# 🔟 Release-Prozess



Der Releaseprozess folgt dem Standard großer Plattformen:



\### 1. Änderungen abgeschlossen  

\### 2. PR in `dev` mergen  

\### 3. Integration testen  

\### 4. `dev` → `main` mergen  

\### 5. Version bump  

\### 6. Eintrag in CHANGELOG.md  

\### 7. GitHub Release erstellen  

\### 8. Tag setzen:


v1.0.0

v1.0.1

v1.1.0

v1.5.0

v2.0.0



---



\# ✔️ CONTRIBUTING abgeschlossen



Danke fürs Mitarbeiten am globalen Lebens-Assistenz-System!



