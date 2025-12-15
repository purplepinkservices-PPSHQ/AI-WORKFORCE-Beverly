const { parentPort } = require("worker_threads");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");

parentPort.on("message", async (buffer) => {
    try {
        const processed = await sharp(buffer)
            .rotate()
            .grayscale()
            .normalize()
            .resize({ width: 1800 })
            .toBuffer();

        const result = await Tesseract.recognize(processed, "deu");
        parentPort.postMessage({ ok: true, text: result.data.text });
    } catch (err) {
        parentPort.postMessage({ ok: false, error: err.message });
    }
});