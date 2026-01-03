// ============================================================
// Datei: src/modules/legal-lawyer/index.js
// 🔁 WIEDERHERGESTELLTER FUNKTIONSZUSTAND (MENÜ IMMER SICHTBAR)
// ============================================================
"use strict";

const { matches } = require("./match");
const { analyze } = require("./analyze");
const { feedback } = require("./feedback");

const { buildLegalReviewReport } = require("./legal-review-engine");
const { buildOpenAIReview } = require("./legal-review-openai-engine");

/* =========================================================
   MENÜ (IMMER SICHTBAR)
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
    "➡️ Antworte mit **1–6** oder lade ein weiteres Dokument hoch."
  );
}

function clampText(s, max) {
  const t = String(s || "");
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

/* =========================================================
   OPTION 6 – IM ALTEN FORMAT (MENÜ IMMER DRAN)
   ========================================================= */
function buildOption6Message(baseReport, aiBlock) {
  const header = "🔍 **Schreiben rechtlich prüfen**\n\n";
  const footer = "\n\n" + replyMenu();

  const max = 1500;
  const body = clampText((baseReport || "") + (aiBlock || ""), max - header.length - footer.length);

  return header + body + footer;
}

/* =========================================================
   OPTIONEN 1–5 (UNVERÄNDERT)
   ========================================================= */
function handleReplyRequest(input = "", lastAnalysis = {}) {
  const map = {
    "1": "fristverlaengerung",
    "2": "ratenzahlung",
    "3": "widerspruch",
    "4": "kuendigung",
    "5": "pruefung"
  };

  if (!map[input]) return null;

  const text = feedback(lastAnalysis);

  return {
    message:
      `✅ **Antwort-Vorlage**\n\n` +
      "```text\n" +
      text +
      "\n```\n\n" +
      replyMenu()
  };
}

/* =========================================================
   OPTION 6 – ASYNC (OPENAI) – ALTLOGIK
   ========================================================= */
async function handleReplyRequestAsync(
  input = "",
  lastAnalysis = {},
  rawText = "",
  cache = {}
) {
  if (input !== "6") return null;

  const baseReport = buildLegalReviewReport(lastAnalysis);

  let aiBlock = "";
  let aiHash = "";
  let aiReview = null;

  if (rawText && rawText.length > 20) {
    const ai = await buildOpenAIReview({
      analysis: lastAnalysis,
      rawText,
      cachedHash: cache.hash,
      cachedReview: cache.review
    });

    aiHash = ai.hash;
    aiReview = ai.review;
    aiBlock = "\n\n" + ai.reportText;
  }

  return {
    message: buildOption6Message(baseReport, aiBlock),
    aiHash,
    aiReview
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