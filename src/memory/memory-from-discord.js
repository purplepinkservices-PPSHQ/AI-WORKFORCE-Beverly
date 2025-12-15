// src/memory/memory-from-discord.js

const { writeProjectMemory } = require("../notion/write-project-memory");

/**
 * Phase B2 – Auto Memory
 * - erkennt Kontext-Signal (Start / Fortsetzen / Abschluss / Fehler / Wechsel)
 * - setzt Priorität logisch
 * - vergibt Memory Tags stabil
 * - KEINE KI, NUR Regeln
 */

// ------------------------------------------------------------
// FILTER
// ------------------------------------------------------------
function shouldIgnore(content) {
    if (!content) return true;

    const text = content.trim().toLowerCase();
    if (text.length < 3) return true;

    const ignoreExact = [
        "ok", "okay", "jo", "ja", "ne",
        "passt", "👍", "👌", "lol", "test"
    ];

    return ignoreExact.includes(text);
}

// ------------------------------------------------------------
// KONTEXT-SIGNAL ERKENNEN
// ------------------------------------------------------------
function detectContextSignal(text) {
    if (
        text.includes("fehler") ||
        text.includes("panic") ||
        text.includes("angst") ||
        text.includes("kaputt")
    ) return "Fehlerzustand";

    if (
        text.includes("fertig") ||
        text.includes("abgeschlossen") ||
        text.includes("passt jetzt")
    ) return "Abschluss";

    if (
        text.includes("wechsel") ||
        text.includes("anderes thema") ||
        text.includes("neues thema")
    ) return "Wechsel";

    if (
        text.includes("start") ||
        text.includes("los geht") ||
        text.includes("phase")
    ) return "Start";

    return "Fortsetzen";
}

// ------------------------------------------------------------
// KONTEXT-MATCHING SCORE
// ------------------------------------------------------------
function calculateContextMatching(text) {
    let score = 30;

    const keywords = [
        "problem", "fehler", "idee", "plan",
        "phase", "snapshot", "memory",
        "system", "bot", "beverly",
        "roadmap", "panic", "vision"
    ];

    keywords.forEach(word => {
        if (text.includes(word)) score += 8;
    });

    return Math.min(score, 100);
}

// ------------------------------------------------------------
// MEMORY TAGS
// ------------------------------------------------------------
function detectTags(text) {
    const tags = [];

    if (text.includes("fehler") || text.includes("error")) tags.push("Fehler");
    if (text.includes("idee") || text.includes("feature")) tags.push("Feature");
    if (text.includes("roadmap") || text.includes("phase")) tags.push("Roadmap");
    if (text.includes("system") || text.includes("bot")) tags.push("Backend / System");
    if (text.includes("memory") || text.includes("snapshot")) tags.push("Memory Engine");

    if (tags.length === 0) tags.push("Notion");

    return tags;
}

// ------------------------------------------------------------
// PRIORITÄT
// ------------------------------------------------------------
function determinePriority(signal, matching) {
    if (signal === "Fehlerzustand") return "Kritisch";
    if (matching > 75) return "Hoch";
    if (matching > 45) return "Mittel";
    return "Niedrig";
}

// ------------------------------------------------------------
// HAUPTFUNKTION
// ------------------------------------------------------------
async function writeMemoryFromDiscord({ databaseId, message, source }) {
    const raw = message.content || "";
    const content = raw.trim();
    const text = content.toLowerCase();

    if (shouldIgnore(content)) return;

    const kontextSignal = detectContextSignal(text);
    const kontextMatching = calculateContextMatching(text);
    const memoryTags = detectTags(text);
    const prioritaet = determinePriority(kontextSignal, kontextMatching);

    await writeProjectMemory({
        databaseId,
        title: "Auto Memory – Discord DM",
        beschreibung: content,
        memoryTags,
        prioritaet,
        lastContext: "Discord DM",
        kontextSignal,
        kontextMatching,
        aktivierterKontext: true,
        letzteAktion: "Gespeichert",
        supervisorFlag: kontextSignal === "Fehlerzustand",
        snapshot: content.length > 300
            ? content.slice(0, 300) + "…"
            : content,
        systemHinweis: "Auto Memory Phase B2",
        kontext: source || "Discord"
    });
}

module.exports = { writeMemoryFromDiscord };

