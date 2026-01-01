"use strict";

function feedback(result) {
  let text =
    "⚖️ **Behörden- & Rechtsprüfung**\n\n" +
    `📄 **Art:** ${result.type}\n` +
    `🏛️ **Absender:** ${result.creditor}\n\n` +
    "🧠 **Kurz erklärt:**\n" +
    "Dieses Schreiben fordert dich zu einer Handlung auf.\n\n";

  // ⏰ Fristen
  if (result.deadline?.found) {
    if (result.deadline.date) {
      text +=
        "⏰ **Frist:**\n" +
        `Bis **${formatDate(result.deadline.date)}** ` +
        `(noch ${result.deadline.daysLeft} Tage)\n\n`;

      if (result.deadline.critical) {
        text += "⚠️ **Diese Frist ist zeitkritisch.**\n\n";
      }
    } else {
      text +=
        "⏰ **Frist:**\n" +
        result.deadline.hint +
        "\n\n";
    }
  }

  // 💰 Beträge
  if (result.amounts?.found) {
    text +=
      "💰 **Geforderter Betrag:**\n" +
      `${formatMoney(result.amounts.total)} EUR\n\n`;
  }

  text +=
    "✍️ Reagiere mit **Antwort verfassen**, wenn ich dir beim Schreiben helfen soll.\n" +
    "📎 Du kannst jederzeit direkt ein weiteres Dokument hochladen.";

  return text;
}

function formatDate(d) {
  return d.toLocaleDateString("de-DE");
}

function formatMoney(n) {
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

module.exports = { feedback };