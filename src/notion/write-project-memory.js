// src/notion/write-project-memory.js

const { getNotion } = require("./client");

console.log("🧠 write-project-memory.js LOADED – SAFE TITLE VERSION");

/**
 * Schreibt einen Snapshot in die Project Memory Database
 * TITEL ist IMMER abgesichert (Notion-Pflichtfeld)
 */
async function writeProjectMemory({
    databaseId,
    title,
    beschreibung = "",
    memoryTags = [],
    prioritaet = "Mittel",
    lastContext = "",
    kontextSignal = "Fortsetzen",
    kontextMatching = 50,
    aktivierterKontext = false,
    letzteAktion = "Gespeichert",
    supervisorFlag = false,
    snapshot = "",
    systemHinweis = "",
    kontext = ""
}) {
    const notion = getNotion();

    // 🔒 HARD SAFETY – Notion braucht IMMER einen Titel
    const safeTitle =
        typeof title === "string" && title.trim().length > 0
            ? title.trim()
            : "Auto-Snapshot (Fallback)";

    return await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
            Titel: {
                title: [{ text: { content: safeTitle } }]
            },

            Beschreibung: {
                rich_text: [{ text: { content: beschreibung } }]
            },

            "Memory Tag": {
                multi_select: memoryTags.map(t => ({ name: t }))
            },

            Priorität: {
                select: { name: prioritaet }
            },

            "Last Context": {
                rich_text: [{ text: { content: lastContext } }]
            },

            "Kontext-Signal": {
                select: { name: kontextSignal }
            },

            "Kontext-Matching": {
                number: kontextMatching
            },

            "Aktivierter Kontext": {
                checkbox: aktivierterKontext
            },

            "Letzte Aktion": {
                select: { name: letzteAktion }
            },

            "Supervisor-Flag": {
                checkbox: supervisorFlag
            },

            Snapshot: {
                rich_text: [{ text: { content: snapshot } }]
            },

            "System Hinweis": {
                rich_text: [{ text: { content: systemHinweis } }]
            },

            Kontext: {
                rich_text: [{ text: { content: kontext } }]
            }
        }
    });
}

module.exports = { writeProjectMemory };



