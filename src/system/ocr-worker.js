// ============================================================
// OCR WORKER THREAD (Sprint 2)
// Läuft komplett getrennt vom Main-Thread
// ============================================================

const { parentPort } = require("worker_threads");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");

// Eingehender Task vom Main Thread
parentPort.on("message", async (buffer) => {
    try {
        // 1) Preprocessing – stark optimiert für OCR
        const processed = await sharp(buffer)
            .rotate()
            .grayscale()
            .normalize()
            .sharpen()
            .median(1)
            .resize({
                width: 1800,
                withoutEnlargement: true
            })
            .toBuffer();

        // 2) OCR
        const result = await Tesseract.recognize(processed, "deu", {
            logger: () => {} // Logging unterdrückt
        });

        let text = (result.data.text || "")
            .replace(/\n{2,}/g, "\n")
            .replace(/[^\S\r\n]+/g, " ")
            .trim();

        parentPort.postMessage({ ok: true, text });

    } catch (err) {
        console.error("[OCR WORKER ERROR]", err);
        parentPort.postMessage({ ok: false, text: "" });
    }
});
