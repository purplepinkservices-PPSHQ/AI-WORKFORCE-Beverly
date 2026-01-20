"use strict";

const texts = {
  month: (ctx) =>
    `📅 Monatliche Einordnung\nDieses Dokument wird dem Monat **${ctx.month}** zugeordnet.`,

  category: (ctx) =>
    `📂 Kategorie\nZuordnung: **${ctx.category}**\nAbsender: **${ctx.creditorName}**`,

  summary: (ctx) => {
    const dir =
      ctx.direction === "income"
        ? "Einnahme"
        : ctx.direction === "expense"
        ? "Ausgabe"
        : "Bewegung";

    const amount =
      typeof ctx.total === "number" ? `${ctx.total.toFixed(2)} €` : "Betrag unbekannt";

    return `💰 Zusammenfassung\nArt: **${dir}**\nBetrag: **${amount}**`;
  },

  document: (ctx) =>
    `📄 Haushaltsbuch-Eintrag\nDieses Dokument stellt eine **${ctx.direction}** im Bereich **${ctx.category}** dar.`,

  help: () =>
    `ℹ️ Haushaltsbuch\nDas Haushaltsbuch gibt dir eine strukturierte Übersicht über Einnahmen und Ausgaben.\nEs speichert nichts und verändert keine Daten – es erklärt nur.`,
};

module.exports = {
  texts,
};