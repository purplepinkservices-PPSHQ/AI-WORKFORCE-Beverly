const { writeProjectMemory } = require("../notion/write-project-memory");

async function writeDailySnapshot({ databaseId, title, description, signal }) {
    return writeProjectMemory({
        databaseId,
        title,
        beschreibung: description,
        memoryTags: ["Snapshot"],
        prioritaet: "Mittel",
        lastContext: "Discord Command",
        kontextSignal: signal,
        kontextMatching: signal === "Abschluss" ? 85 : 65,
        aktivierterKontext: signal !== "Abschluss",
        letzteAktion: "Gespeichert",
        supervisorFlag: false,
        snapshot: `${signal}-Snapshot`,
        systemHinweis: "Phase B – Daily Snapshot",
        kontext: "Command → Snapshot",
    });
}

module.exports = { writeDailySnapshot };
