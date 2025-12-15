// ============================================================
// OCR WORKER PROXY
// Bridge zwischen Main-Thread und OCR Worker
// ============================================================

const path = require("path");
const { Worker } = require("worker_threads");

let worker = null;
let isReady = false;

// Worker starten
function initWorker() {
    if (worker) return;

    worker = new Worker(path.join(__dirname, "ocr-worker.js"));

    worker.on("online", () => {
        console.log("🔵 OCR-Worker gestartet.");
        isReady = true;
    });

    worker.on("error", (err) => {
        console.error("❌ OCR Worker Fehler:", err);
        isReady = false;
    });

    worker.on("exit", (code) => {
        console.error("❌ OCR Worker beendet. Code:", code);
        isReady = false;

        // Automatisch neu starten
        setTimeout(() => {
            console.log("🔄 Starte OCR Worker neu…");
            initWorker();
        }, 500);
    });
}

// Sofort starten
initWorker();

/**
 * Führt OCR asynchron im Worker durch.
 * @param {Buffer} buffer
 * @returns Promise<string>
 */
function runOCR(buffer) {
    return new Promise((resolve) => {

        if (!isReady) {
            console.warn("⚠️ OCR Worker nicht bereit, versuche Restart…");
            initWorker();
            return resolve(""); // Nie blockieren
        }

        const listener = (msg) => {
            worker.off("message", listener);
            if (msg.ok) resolve(msg.text || "");
            else resolve("");
        };

        worker.on("message", listener);
        worker.postMessage(buffer);
    });
}

module.exports = {
    runOCR
};