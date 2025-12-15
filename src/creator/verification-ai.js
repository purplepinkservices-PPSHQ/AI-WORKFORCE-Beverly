/**
 * Mini-KI für Zwischenbewertungen während der Creator-Verifizierung.
 * Wird vom Router aufgerufen, wenn eine Nachricht NICHT zur Hauptverifizierung gehört.
 */

async function handleAIMessage(message) {
    const content = (message.content || "").trim().toLowerCase();

    // Nur reagieren, wenn explizit KI-Hilfe erwünscht ist
    if (!content.includes("ai") && !content.includes("hilfe")) {
        return false;
    }

    await message.reply(
        "🤖✨ *Mini-KI aktiviert!* \n" +
        "Ich helfe dir kurz weiter – sag mir, wobei du Unterstützung brauchst 💙"
    );

    return true;
}

module.exports = {
    handleAIMessage
};