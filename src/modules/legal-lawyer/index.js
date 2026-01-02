// ============================================================
// Datei: src/modules/legal-lawyer/index.js
// ============================================================
"use strict";

const { matches } = require("./match");
const { analyze } = require("./analyze");
const { feedback } = require("./feedback");

// ✅ ADD-ON: strukturierter Prüfbericht (bestehend)
const { buildLegalReviewReport } = require("./legal-review-engine");

// ✅ ADD-ON: OpenAI-Vertiefung NUR für Option 6
const { buildOpenAIReview } = require("./legal-review-openai-engine");

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

function clampText(s, max) {
  const t = String(s || "");
  if (t.length <= max) return t;
  return t.slice(0, Math.max(0, max - 1)) + "…";
}

/**
 * Baut Option-6 Nachricht, aber begrenzt auf 1500 Zeichen TOTAL.
 * Menü bleibt IMMER enthalten. Report wird gekürzt.
 */
function buildOption6Message({ baseReport = "", aiBlock = "" } = {}) {
  const menu = replyMenu();
  const header = "🔍 **Schreiben rechtlich prüfen**\n\n";
  const footer = "\n\n➡️ **Wie möchtest du weiter vorgehen?**\n\n" + menu;

  const maxTotal = 1500;

  // Platz für Report:
  const fixedLen = header.length + footer.length;
  const remaining = Math.max(0, maxTotal - fixedLen);

  const reportFull = String(baseReport || "") + String(aiBlock || "");
  const reportShort = clampText(reportFull.trim(), remaining);

  return header + reportShort + footer;
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
   🧠 Auswahl 1–6 verarbeiten (bestehend)
   - 1–5 bleiben synchron und unverändert in der Wirkung
   - 6 wird über handleReplyRequestAsync im Router gemacht (Add-on)
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

/* =========================================================
   ✅ ADD-ON: Async handler NUR für Option 6
   - strukturiert + OpenAI-Vertiefung
   - MESSAGE HARD LIMIT 1500 chars
   ========================================================= */
async function handleReplyRequestAsync(
  input = "",
  lastAnalysis = {},
  rawText = "",
  cache = { hash: "", review: null }
) {
  const choice = String(input).trim();
  if (choice !== "6") return null;

  const baseReport = buildLegalReviewReport(lastAnalysis);

  let aiBlock = "";
  let aiReview = null;
  let aiHash = "";

  if (rawText && String(rawText).trim().length > 20) {
    const ai = await buildOpenAIReview({
      analysis: lastAnalysis,
      rawText,
      cachedHash: cache.hash || "",
      cachedReview: cache.review || null
    });

    aiHash = ai.hash || "";
    aiBlock = "\n\n" + ai.reportText;
    if (ai.ok) aiReview = ai.review;
  } else {
    aiBlock =
      "\n\n🧾 **OpenAI-Vertiefung (Form/Logik)**\n\n" +
      "⚠️ Kein OCR-Text gespeichert – übersprungen.\n";
  }

  const message = buildOption6Message({ baseReport, aiBlock });

  return {
    action: "analyse",
    label: "Schreiben rechtlich prüfen",
    aiHash,
    aiReview,
    message
  };
}

module.exports = {
  id: "legal-lawyer",
  matches,
  analyze,
  feedback,
  replyMenu,
  handleReplyRequest,
  handleReplyRequestAsync
};