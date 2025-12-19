// ============================================================
// Beverly FREE – Document & Media Handler
// Datei: src/free/free-document-engine.js
// ============================================================

"use strict";

/**
 * Verarbeitet normale Textnachrichten / PDFs ohne Attachments
 * Gibt true zurück, wenn handled
 */
async function handleFreeDocument(message) {
    const content = message.content?.toLowerCase();
    if (!content) return false;

    // Trigger-Wörter
    const triggers = [
        "rechnung",
        "angebot",
        "versicherung",
        "behörde",
        "finanzamt",
        "steuer",
        "bank",
        "vertrag"
    ];

    const isDocIntent = triggers.some(t => content.includes(t));
    if (!isDocIntent) return false;

    await message.reply(
        "📄 Alles klar. Wenn du ein Dokument hast, schick es mir einfach als PDF oder Foto 🙂"
    );

    return true;
}

module.exports = {
    handleFreeDocument
};