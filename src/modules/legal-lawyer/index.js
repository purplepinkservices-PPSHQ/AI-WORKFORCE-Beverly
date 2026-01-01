"use strict";

const { matches } = require("./match");
const { analyze } = require("./analyze");
const { feedback } = require("./feedback");

/* =========================================================
   🧩 Antwort-Menü
   ========================================================= */
function replyMenu() {
  return (
    "✍️ **Was soll ich für dich tun?**\n\n" +
    "1️⃣ **Fristverlängerung**\n" +
    "2️⃣ **Ratenzahlung**\n" +
    "3️⃣ **Widerspruch**\n" +
    "4️⃣ **Kündigung**\n" +
    "5️⃣ **Antwort / Klärung formulieren**\n" +
    "6️⃣ **Schreiben rechtlich prüfen**\n\n" +
    "➡️ Antworte einfach mit **1–6**.\n" +
    "📎 Oder lade direkt das nächste Dokument hoch."
  );
}

/* =========================================================
   🧠 Einwände rendern
   ========================================================= */
function renderObjections(objections = []) {
  if (!Array.isArray(objections) || objections.length === 0) return "";

  const critical = objections.filter((o) => o.level === "kritisch");
  const hints = objections.filter((o) => o.level === "hinweis");

  let text = "";

  if (critical.length) {
    text +=
      "🚨 **Kritische Punkte:**\n" +
      critical.map((o) => `– ${o.text}`).join("\n") +
      "\n\n";
  }

  if (hints.length) {
    text +=
      "ℹ️ **Hinweise:**\n" +
      hints.map((o) => `– ${o.text}`).join("\n") +
      "\n\n";
  }

  return text;
}

/* =========================================================
   🔎 Kurzbewertung (nur ADD-ON für Option 6)
   ========================================================= */
function renderQuickReview(lastAnalysis = {}) {
  let t = "";

  // Typ / Absender
  t += `📄 **Typ:** ${lastAnalysis.type || "Unklar"}\n`;
  t += `🏛️ **Absender:** ${lastAnalysis.creditor || "Unbekannt"}\n\n`;

  // Frist
  if (lastAnalysis.deadline?.found) {
    if (lastAnalysis.deadline.date) {
      t +=
        "⏰ **Frist:** " +
        lastAnalysis.deadline.date.toLocaleDateString("de-DE") +
        (typeof lastAnalysis.deadline.daysLeft === "number"
          ? ` (noch ${lastAnalysis.deadline.daysLeft} Tage)`
          : "") +
        "\n";
      if (lastAnalysis.deadline.critical) {
        t += "⚠️ **Frist wirkt zeitkritisch** (bitte sofort handeln).\n";
      } else {
        t += "✅ Frist wirkt **nicht** akut-kritisch.\n";
      }
      t += "\n";
    } else if (lastAnalysis.deadline.hint) {
      t += `⏰ **Frist:** ${lastAnalysis.deadline.hint}\n\n`;
    }
  }

  // Betrag
  if (lastAnalysis.amounts?.found) {
    const money = lastAnalysis.amounts.total.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    t += `💰 **Betrag:** ${money} EUR\n`;

    // einfache Plausibilitäts-Hinweise (neutral)
    if (
      Array.isArray(lastAnalysis.amounts.all) &&
      lastAnalysis.amounts.all.length > 1
    ) {
      t +=
        "ℹ️ Hinweis: Mehrere Beträge erkannt – **Aufschlüsselung prüfen**.\n";
    } else {
      t += "ℹ️ Hinweis: Betrag genannt – **Begründung/Aufschlüsselung prüfen**.\n";
    }
    t += "\n";
  }

  return t;
}

/* =========================================================
   ✍️ Antworttexte (alle Typen)
   ========================================================= */
function generateReply(action, context = {}) {
  const objectionsText = renderObjections(context.objections);

  const deadlineText =
    context.deadline?.date
      ? `Die gesetzte Frist endet am ${context.deadline.date.toLocaleDateString(
          "de-DE"
        )}.\n\n`
      : "";

  const amountText =
    context.amounts?.found
      ? `Der geforderte Betrag beläuft sich auf ${context.amounts.total.toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        )} EUR.\n\n`
      : "";

  switch (action) {
    case "fristverlaengerung":
      return (
        "Sehr geehrte Damen und Herren,\n\n" +
        deadlineText +
        objectionsText +
        "hiermit bitte ich um eine angemessene Verlängerung der gesetzten Frist.\n\n" +
        "Aufgrund meiner aktuellen Situation ist es mir derzeit nicht möglich, " +
        "die Angelegenheit innerhalb der Frist abschließend zu klären.\n\n" +
        "Ich bitte um schriftliche Bestätigung.\n\n" +
        "Mit freundlichen Grüßen\n"
      );

    case "ratenzahlung":
      return (
        "Sehr geehrte Damen und Herren,\n\n" +
        amountText +
        objectionsText +
        "hiermit beantrage ich die Prüfung einer Ratenzahlung.\n\n" +
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
        "Bitte bestätigen Sie mir den Beendigungszeitpunkt schriftlich.\n\n" +
        "Mit freundlichen Grüßen\n"
      );

    case "pruefung":
      return (
        "Sehr geehrte Damen und Herren,\n\n" +
        amountText +
        objectionsText +
        "ich bitte um erneute sachliche und rechtliche Prüfung des genannten Vorgangs.\n\n" +
        "Bitte teilen Sie mir das Ergebnis Ihrer Prüfung schriftlich mit.\n\n" +
        "Mit freundlichen Grüßen\n"
      );

    default:
      return null;
  }
}

/* =========================================================
   🧠 Auswahl 1–6 verarbeiten
   ========================================================= */
function handleReplyRequest(input = "", lastAnalysis = {}) {
  const choice = String(input).trim();

  const map = {
    "1": { action: "fristverlaengerung", label: "Fristverlängerung" },
    "2": { action: "ratenzahlung", label: "Ratenzahlung" },
    "3": { action: "widerspruch", label: "Widerspruch" },
    "4": { action: "kuendigung", label: "Kündigung" },
    "5": { action: "pruefung", label: "Antwort / Klärung" }
  };

  // 🔍 OPTION 6 = NUR PRÜFUNG + MENÜ ZURÜCK (ERGÄNZT, sonst nix geändert)
  if (choice === "6") {
    const quick = renderQuickReview(lastAnalysis);
    const objectionText = renderObjections(lastAnalysis.objections);

    return {
      action: "analyse",
      label: "Rechtliche Prüfung",
      message:
        "🔍 **Rechtliche Prüfung des Schreibens**\n\n" +
        quick +
        objectionText +
        "➡️ **Wie möchtest du weiter vorgehen?**\n\n" +
        replyMenu()
    };
  }

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
      "\n```\n\n" +
      "➡️ **Wie möchtest du weiter vorgehen?**\n\n" +
      replyMenu()
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