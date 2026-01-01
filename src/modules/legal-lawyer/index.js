"use strict";

const { matches } = require("./match");
const { analyze } = require("./analyze");
const { feedback } = require("./feedback");

/* =========================================================
   🧩 Antwort-Menü
   ========================================================= */
function replyMenu() {
  return (
    "✍️ **Welche Art von Antwort soll ich für dich vorbereiten?**\n\n" +
    "1️⃣ **Fristverlängerung**\n" +
    "2️⃣ **Ratenzahlung**\n" +
    "3️⃣ **Widerspruch**\n" +
    "4️⃣ **Kündigung**\n" +
    "5️⃣ **Prüfung / Klärung**\n\n" +
    "➡️ Antworte einfach mit **1–5**.\n" +
    "📎 Du kannst jederzeit weitere Dokumente hochladen."
  );
}

/* =========================================================
   🧠 Einwände aufbereiten (kritisch / Hinweis)
   ========================================================= */
function renderObjections(objections = []) {
  if (!Array.isArray(objections) || objections.length === 0) return "";

  const critical = objections.filter(o => o.level === "kritisch");
  const hints = objections.filter(o => o.level === "hinweis");

  let text = "";

  if (critical.length) {
    text +=
      "⚠️ **Kritische Einwände:**\n" +
      critical.map(o => `– ${o.text}`).join("\n") +
      "\n\n";
  }

  if (hints.length) {
    text +=
      "ℹ️ **Hinweise:**\n" +
      hints.map(o => `– ${o.text}`).join("\n") +
      "\n\n";
  }

  return text;
}

/* =========================================================
   ✍️ Antwort-Text-Skeletons (ALLE TYPEN)
   ========================================================= */
function generateReply(action, context = {}) {
  const objectionsText = renderObjections(context.objections);

  const deadlineText =
    context.deadline?.date
      ? `Die gesetzte Frist endet am ${context.deadline.date.toLocaleDateString("de-DE")}.\n\n`
      : "";

  const amountText =
    context.amounts?.found
      ? `Der geforderte Betrag beläuft sich auf ${context.amounts.total.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} EUR.\n\n`
      : "";

  switch (action) {
    case "fristverlaengerung":
      return (
        "Sehr geehrte Damen und Herren,\n\n" +
        deadlineText +
        "hiermit bitte ich um eine angemessene Verlängerung der gesetzten Frist.\n\n" +
        objectionsText +
        "Aufgrund meiner aktuellen Situation ist es mir derzeit nicht möglich, " +
        "die Angelegenheit innerhalb der Frist abschließend zu klären.\n\n" +
        "Ich bitte um schriftliche Bestätigung.\n\n" +
        "Mit freundlichen Grüßen\n"
      );

    case "ratenzahlung":
      return (
        "Sehr geehrte Damen und Herren,\n\n" +
        amountText +
        "hiermit beantrage ich die Prüfung einer Ratenzahlung.\n\n" +
        objectionsText +
        "Der Gesamtbetrag kann aktuell nicht in einer Summe beglichen werden. " +
        "Ich bin jedoch bereit, meiner Verpflichtung im Rahmen einer tragfähigen Lösung nachzukommen.\n\n" +
        "Bitte teilen Sie mir die möglichen Konditionen schriftlich mit.\n\n" +
        "Mit freundlichen Grüßen\n"
      );

    case "widerspruch":
      return (
        "Sehr geehrte Damen und Herren,\n\n" +
        "hiermit lege ich fristgerecht Widerspruch gegen Ihr Schreiben ein.\n\n" +
        objectionsText +
        "Ich bitte um erneute rechtliche und sachliche Prüfung sowie um schriftliche Bestätigung.\n\n" +
        "Mit freundlichen Grüßen\n"
      );

    case "kuendigung":
      return (
        "Sehr geehrte Damen und Herren,\n\n" +
        "hiermit kündige ich das bestehende Vertrags- bzw. Rechtsverhältnis fristgerecht.\n\n" +
        objectionsText +
        "Bitte bestätigen Sie mir den Beendigungszeitpunkt sowie den Ausgleich etwaiger Restverpflichtungen schriftlich.\n\n" +
        "Mit freundlichen Grüßen\n"
      );

    case "pruefung":
      return (
        "Sehr geehrte Damen und Herren,\n\n" +
        amountText +
        "ich bitte um erneute sachliche und rechtliche Prüfung des genannten Vorgangs.\n\n" +
        objectionsText +
        "Bitte teilen Sie mir das Ergebnis Ihrer Prüfung schriftlich mit.\n\n" +
        "Mit freundlichen Grüßen\n"
      );

    default:
      return null;
  }
}

/* =========================================================
   🧠 Auswahl 1–5 verarbeiten (KEIN Dead-End)
   ========================================================= */
function handleReplyRequest(input = "", lastAnalysis = {}) {
  const choice = String(input).trim();

  const map = {
    "1": { action: "fristverlaengerung", label: "Fristverlängerung" },
    "2": { action: "ratenzahlung", label: "Ratenzahlung" },
    "3": { action: "widerspruch", label: "Widerspruch" },
    "4": { action: "kuendigung", label: "Kündigung" },
    "5": { action: "pruefung", label: "Prüfung / Klärung" }
  };

  if (!map[choice]) return null;

  const replyText = generateReply(map[choice].action, lastAnalysis);

  return {
    action: map[choice].action,
    label: map[choice].label,
    replyText,
    message:
      `✅ **Antwort-Entwurf (${map[choice].label})**\n\n` +
      "```text\n" +
      replyText +
      "\n```\n" +
      "✍️ Sag mir Bescheid, wenn ich den Text anpassen soll.\n" +
      "📎 Du kannst jederzeit weitere Dokumente hochladen."
  };
}

module.exports = {
  id: "legal-lawyer",
  matches,
  analyze,
  feedback,
  replyMenu,
  handleReplyRequest
};