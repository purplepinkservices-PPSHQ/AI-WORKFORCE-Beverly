// src/cloud/dropbox.js

const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

const dbx = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    fetch,
});

// ---------------------------------------------------------
// INTERNER HELFER – Ordner sicher erstellen
// ---------------------------------------------------------
async function ensureFolder(path) {
    try {
        await dbx.filesCreateFolderV2({ path, autorename: false });
        console.log(`[Dropbox] Ordner erstellt: ${path}`);
    } catch (err) {
        // Konflikt = Ordner existiert bereits
        if (err?.error?.error_summary?.includes("conflict")) {
            console.log(`[Dropbox] Ordner existiert bereits: ${path}`);
            return;
        }

        console.error(`[Dropbox] Fehler beim Erstellen von ${path}`, err);
    }
}

// ---------------------------------------------------------
// EXPORTIERT: createDropboxFolderIfMissing
// (wird vom Auto-Ordner-Generator verwendet)
// ---------------------------------------------------------
async function createDropboxFolderIfMissing(path) {
    try {
        await dbx.filesCreateFolderV2({ path, autorename: false });
        console.log(`[Dropbox] ✔ Ordner erstellt: ${path}`);
    } catch (err) {
        if (err?.error?.error_summary?.includes("conflict")) {
            console.log(`[Dropbox] ✔ Ordner existiert bereits: ${path}`);
            return;
        }

        console.error(`[Dropbox] ❌ Fehler bei createFolder: ${path}`, err);
    }
}

// ---------------------------------------------------------
// INITIALISIERUNG – Beverly Ordnerstruktur
// ---------------------------------------------------------
async function initializeDropboxStructure() {
    console.log("🔧 Erstelle Beverly-Cloud-Struktur …");

    await ensureFolder("/Beverly");

    const folders = [
        "/Beverly/Steuerberater",
        "/Beverly/Steuerberater/Übersichten",
        "/Beverly/Steuerberater/Zusammenfassungen",
        "/Beverly/Steuerberater/Reports",

        "/Beverly/Zusammenfassung",
        "/Beverly/Verbindlichkeiten",
        "/Beverly/Einkommen",
        "/Beverly/Amt",
        "/Beverly/Versicherung",
        "/Beverly/Bank",
        "/Beverly/Allgemeines",
        "/Beverly/Haushalt",
        "/Beverly/Gewerbe",
        "/Beverly/KFZ",
        "/Beverly/Reisen",

        "/Beverly/Archiv"
    ];

    for (const folder of folders) {
        await ensureFolder(folder);
    }

    console.log("📁 Beverly-Cloud-Struktur vollständig bereit.");
}

// ---------------------------------------------------------
// Datei hochladen
// ---------------------------------------------------------
async function uploadFileToDropbox(targetFolder, filename, buffer) {
    try {
        const normalized = targetFolder.replace(/\/+$/, "");
        const fullPath = `${normalized}/${filename}`;

        const result = await dbx.filesUpload({
            path: fullPath,
            contents: buffer,
            mode: { ".tag": "overwrite" }
        });

        console.log(`[Dropbox] Datei gespeichert unter: ${fullPath}`);
        return fullPath;

    } catch (err) {
        console.error("[Dropbox UPLOAD FEHLER]", err);

        if (err.error?.error_summary?.includes("malformed_path")) {
            console.error("❗ PATH-PROBLEM – vermutlich Sonderzeichen im Dateinamen");
        }

        return null;
    }
}

module.exports = {
    initializeDropboxStructure,
    uploadFileToDropbox,
    createDropboxFolderIfMissing
};