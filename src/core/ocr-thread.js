const { Worker } = require("worker_threads");
const path = require("path");

function runOCR(buffer) {
    return new Promise((resolve) => {
        const worker = new Worker(path.join(__dirname, "ocr-worker.js"));

        worker.on("message", (msg) => {
            resolve(msg.ok ? msg.text : "");
            worker.terminate();
        });

        worker.postMessage(buffer);
    });
}

module.exports = { runOCR };