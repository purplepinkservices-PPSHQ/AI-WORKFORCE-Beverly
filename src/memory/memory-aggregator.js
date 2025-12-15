// src/memory/memory-aggregator.js

const { writeProjectMemory } = require("../notion/write-project-memory");

/**
 * Phase C – Kontext-Aggregation
 * - sammelt mehrere Messages pro User
 * - schreibt EIN konsolidiertes Memory
 * - steuert Fortschritt, Gewichtung, Fortführbarkeit
 */

const BUFFER_TIME_MS = 2 * 60 * 1000; // 2 Minuten
const userBuffers = new Map();

// ------------------------------------------------------------
// BUFFER HELPERS
// ------------------------------------------------------------
function getUserBuffer(userId) {
    if (!userBuffers.has(userId)) {
        userBuffers.set(userId, {
            messages: [],
            timer: null
        });
    }
    return userBuffers.get(userId);
}

// ------------------------------------------------------------
// KONTEXT ANALYSE
// ------------------------------------------------------------
function calculateProgress(text) {
    if (text.includes("fertig") || text.includes("läuft")) return 100;
    if (text.includes("halb") || text.includes("weiter")) return 60;
    if (text.includes("start")) return 20;
    return 40;
}

function determineFortfuehrbar(progress) {
    return progress < 100;
}

function determineLetzteAktion(progress) {
    if (progress >= 100) return "Archiviert";
    return "Aktualisiert";
}

function determineGewichtung(progress) {
    if (progress >= 80) return 8;
    if (progress >= 50) return 5;
    return 3;
}

// ------------------------------------------------------------
// FLUSH
// ------------------------------------------------------------
async function flushUserBuffer(userId, databaseId) {
    const buffer = userBuffers.get(userId);
    if (!buffer || buffer.messages.length === 0) return;

    const combinedText = buffer.messages.join("\n");
    const textLower = combinedText.toLowerCase();

    const progress = calculateProgress(textLower);
    const fortfuehrbar = determineFortfuehrbar(progress);
    const letzteAktion = determineLetzteAktion(progress);
    const gewichtung = determineGewichtung(progress);

    await writeProjectMemory({
        databaseId,
        title: "Auto Memory – Kontext-Block",
        beschreibung: combinedText,
        memoryTags: ["Memory Engine", "Routing"],
        prioritaet: progress >= 80 ? "Hoch" : "Mittel",
        lastContext: "Discord DM (aggregiert)",
        kontextSignal: fortfuehrbar ? "Fortsetzen" : "Abschluss",
        kontextMatching: 85,
        aktivierterKontext: fortfuehrbar,
        letzteAktion,
        supervisorFlag: false,
        snapshot: combinedText.slice(0, 500),
        systemHinweis: "Phase C – Kontext Aggregation",
        kontext: "Mehrere DM-Nachrichten",
        fortfuehrbar,
        fortschritt: progress,
        gewichtung
    });

    clearTimeout(buffer.timer);
    userBuffers.delete(userId);
}

// ------------------------------------------------------------
// PUBLIC API
// ------------------------------------------------------------
function collectDiscordMessage({ databaseId, message }) {
    const userId = message.author.id;
    const content = message.content?.trim();
    if (!content) return;

    const buffer = getUserBuffer(userId);
    buffer.messages.push(content);

    if (buffer.timer) clearTimeout(buffer.timer);

    buffer.timer = setTimeout(() => {
        flushUserBuffer(userId, databaseId)
            .catch(err => console.error("❌ Phase C Flush Fehler:", err));
    }, BUFFER_TIME_MS);
}

module.exports = { collectDiscordMessage };
