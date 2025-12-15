// src/creator/folders.js

const { createDropboxFolderIfMissing } = require("../cloud/dropbox");

// Jahresbereiche
const YEARS = ["2023", "2024", "2025", "2026"];

// Monate vollständig
const MONTHS = [
    "Januar", "Februar", "Maerz", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
];

// Name bereinigen
function sanitizeName(name) {
    return name.replace(/[^\wäöüÄÖÜß]/g, "_").substring(0, 40);
}

/**
 * Auto-Ordner-Generator für neue Models
 */
async function createModelFolderStructure(modelName) {
    const clean = sanitizeName(modelName);
    const base = `/Models/${clean}`;

    console.log(`📁 Erstelle Creator-Ordner für: ${clean}`);

    // Basis-Ordner
    const folders = [
        `${base}`,
        `${base}/Verifizierung / PPSHQ Unterlagen (AGB etc.)`,

        `${base}/Content`,
        `${base}/Content/Thumbnails`,
        `${base}/Content/Clips`,
        `${base}/Content/Fotos`,
        `${base}/Content/Vertraege`,

        `${base}/Belege`,

        `${base}/Backup`,
        `${base}/Unterlagen Steuerberater`,
        `${base}/Unterlagen von Beverly`,
        `${base}/Gewerbe Unterlagen wichtig`,
        `${base}/private Dokumente`
    ];

    // Basis-Ordner erzeugen
    for (const folder of folders) {
        await safeCreate(folder);
    }

    // Jahres- und Monats-Ordner erzeugen
    for (const year of YEARS) {
        const yearPath = `${base}/Belege/${year}`;
        await safeCreate(yearPath);

        for (const month of MONTHS) {
            const monthPath = `${yearPath}/${month}`;
            await safeCreate(monthPath);
        }
    }

    console.log(`🎉 Model-Ordnerstruktur für ${clean} fertig.`);
    return true;
}

/** sichere Ordnererstellung */
async function safeCreate(path) {
    try {
        await createDropboxFolderIfMissing(path);
        console.log(`   ✔ ${path}`);
    } catch (err) {
        console.error(`   ❌ Fehler bei ${path}`, err);
    }
}

module.exports = {
    createModelFolderStructure
};