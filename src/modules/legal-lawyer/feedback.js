"use strict";

function feedback(result) {
  let text =
    "⚖️ **Behörden- & Rechtsprüfung**\n\n" +
    `📄 **Art:** ${result.type}\n` +
    `🏛️ **Absender:** ${result.creditor}\n\n` +
    "🧠 **Kurz erklärt:**\n" +
    "Dieses Schreiben fordert dich zu einer Handlung auf.\n\n";

  // ⏰ Frist
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

  // 💰 Betrag
  if (result.amounts?.found) {
    text +=
      "💰 **Geforderter Betrag:**\n" +
      `${formatMoney(result.amounts.total)} EUR\n\n`;
  }

  // ⚠️ Einwände (priorisiert)
  if (result.objections?.length) {
    const critical = result.objections.filter(o => o.level === "kritisch");
    const hints = result.objections.filter(o => o.level === "hinweis");

    if (critical.length) {
      text += "🚨 **Kritische Einwände:**\n";
      critical.forEach(o => {
        text += `– ${o.text}\n`;
      });
      text += "\n";
    }

    if (hints.length) {
      text += "ℹ️ **Hinweise:**\n";
      hints.forEach(o => {
        text += `– ${o.text}\n`;
      });
      text += "\n";
    }
  }

  text +=
    "✍️ Reagiere mit **Antwort verfassen**, wenn ich dir beim Schreiben helfen soll.";

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