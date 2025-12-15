/**
 * Mini-„Brain“ System für Creator-Verifizierung.
 * Nutzt leichte Logik (keine KI) zur Bewertung oder zum Hinweisgeben.
 */

async function handleBrainMessage(message) {
    const content = (message.content || "").trim().toLowerCase();

    // Brain reagiert nur auf bestimmte Schlüsselwörter
    const triggers = ["bin unsicher", "passt das", "richtig", "check", "hilfe brain"];
    if (!triggers.some(t => content.includes(t))) {
        return false;
    }

    await message.reply(
        "🧠💙 *Brain aktiviert!* \n" +
        "Ich prüfe das kurz für dich…\n" +
        "Das sieht gut aus – mach einfach weiter, du bist auf dem richtigen Weg! 🚀"
    );

    return true;
}

module.exports = {
    handleBrainMessage
};