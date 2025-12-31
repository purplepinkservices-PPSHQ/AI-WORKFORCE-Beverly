"use strict";

function feedback(result) {
  return (
    "⚖️ **Behörden- & Rechtsprüfung**\n\n" +
    `📄 **Art:** ${result.type}\n` +
    `🏛️ **Absender:** ${result.creditor}\n\n` +
    "🧠 **Kurz erklärt:**\n" +
    "Dieses Schreiben fordert dich zu einer Handlung auf (z. B. Zahlung, Stellungnahme oder Fristbeachtung).\n\n" +
    "👉 **Was möchtest du tun?**\n" +
    "✍️ Reagiere mit **Antwort verfassen**, wenn ich dir beim Schreiben helfen soll\n"
  );
}

module.exports = { feedback };