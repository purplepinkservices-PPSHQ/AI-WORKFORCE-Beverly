// ============================================================
// FILE: src/free/pdf-handler.js
// PURPOSE:
// - Liest PDFs vollständig (pdf-parse)
// - Erkennt Absender & Dokument-Typ (z.B. Finanzamt)
// - Leitet korrekten Dropbox-Pfad ab
// ============================================================

const pdfParse = require("pdf-parse");
const path = require("path");
const { uploadToDropbox } = require("../cloud/dropbox");

// ------------------------------------------------------------
// HELPER: Text normalisieren
// ------------------------------------------------------------
function normalize(text = "") {
    return text
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^a-zäöüß0-9 ]/gi, "")
        .trim();
}

// ------------------------------------------------------------
// HELPER: Dokument-Typ erkennen
// ------------------------------------------------------------
function detectDocumentType(text) {
    const t = normalize(text);

    if (
        t.includes("finanzamt") ||
        t.includes("steuerbescheid") ||
        t.includes("einkommensteuer") ||
        t.includes("umsatzsteuer")
    ) {
        return {
            category: "Steuer",
            sender: "Finanzamt",
        };
    }

    if (
        t.includes("versicherung") ||
        t.includes("policenummer") ||
        t.includes("versicherungsnehmer")
    ) {
        return {
            category: "Versicherung",
            sender: "Versicherung",
        };
    }

    if (
        t.includes("bank") ||
        t.includes("iban") ||
        t.includes("kontoauszug")
    ) {
        return {
            category: "Bank",
            sender: "Bank",
        };
    }

    if (
        t.includes("behörde") ||
        t.includes("amt") ||
        t.includes("bescheid")
    ) {
        return {
            category: "Behörden",
            sender: "Behörde",
        };
    }

    return {
        category: "Sonstiges",
        sender: "Unbekannt",
    };
}

// ------------------------------------------------------------
// HELPER: Dropbox-Zielpfad bauen
// STRUCTURE: /2025/Thema/Monat
// ------------------------------------------------------------
function buildDropboxPath({ category, date }) {
    const year = date.getFullYear();
    const month = date.toLocaleString("de-DE", { month: "long" });

    return `/${year}/${category}/${month}`;
}

// ------------------------------------------------------------
// MAIN: PDF verarbeiten
// ------------------------------------------------------------
async function handlePdfUpload({ buffer, originalName }) {
    // 1️⃣ PDF lesen
    const parsed = await pdfParse(buffer);
    const text = parsed.text || "";

    // 2️⃣ Typ erkennen
    const meta = detectDocumentType(text);

    // 3️⃣ Zielpfad bestimmen
    const now = new Date();
    const dropboxPath = buildDropboxPath({
        category: meta.category,
        date: now,
    });

    // 4️⃣ Upload
    const targetPath = path.posix.join(dropboxPath, originalName);

    await uploadToDropbox({
        buffer,
        dropboxPath: targetPath,
    });

    // 5️⃣ Rückgabe für Chat / Logs
    return {
        ok: true,
        detectedAs: meta.category,
        sender: meta.sender,
        dropboxPath: targetPath,
    };
}

module.exports = {
    handlePdfUpload,
};