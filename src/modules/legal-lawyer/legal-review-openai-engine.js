// ============================================================
// Datei: src/modules/legal-lawyer/legal-review-openai-engine.js
// Zweck: OpenAI-Vertiefung NUR für Option 6
// Scope: Formfehler + Argumentationsstärke + Bedeutung/Risiken/Handlungsspielraum
// ============================================================
"use strict";

const crypto = require("crypto");
const { extractFacts } = require("./legal-fact-extractor");

// Offizielles OpenAI SDK (npm i openai)
let OpenAI = null;
try {
  OpenAI = require("openai");
} catch (_) {
  OpenAI = null;
}

function sha256(input = "") {
  return crypto.createHash("sha256").update(String(input), "utf8").digest("hex");
}

function safeTrim(text, max = 18000) {
  const t = String(text || "");
  if (t.length <= max) return t;
  return t.slice(0, max);
}

function short(text, max = 260) {
  const t = String(text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

function toBulletList(arr, maxItems = 6) {
  if (!Array.isArray(arr) || arr.length === 0) return "– (keine)\n";
  return arr
    .slice(0, maxItems)
    .map((x) => `– ${String(x)}`)
    .join("\n") + "\n";
}

/* =========================================================
   RENDER REPORT (kompakt, erklärend, schützend)
   ========================================================= */
function renderAIReviewReport(ai = {}) {
  const summary = short(ai.summary || "(keine Zusammenfassung)", 320);

  const critical = Array.isArray(ai.critical_points) ? ai.critical_points : [];
  const hints = Array.isArray(ai.hints) ? ai.hints : [];
  const formErrors = Array.isArray(ai.form_errors) ? ai.form_errors : [];
  const steps = Array.isArray(ai.recommended_steps) ? ai.recommended_steps : [];

  const missing = Array.isArray(ai.missing_or_unclear)
    ? ai.missing_or_unclear
    : [];

  const impact = ai.impact_analysis || {};
  const relevance = Array.isArray(impact.relevance) ? impact.relevance : [];
  const risks = Array.isArray(impact.risks) ? impact.risks : [];
  const safeActions = Array.isArray(impact.safe_actions)
    ? impact.safe_actions
    : [];

  const arg = ai.argumentation_strength || {};
  const score =
    typeof arg.score === "number" ? Math.max(0, Math.min(10, arg.score)) : null;
  const rationale = short(arg.rationale || "", 260);

  const confidence =
    typeof ai.confidence === "number"
      ? Math.max(0, Math.min(1, ai.confidence))
      : null;

  let t = "";
  t += "🧾 **OpenAI-Vertiefung (Form/Logik)**\n\n";
  t += `🧠 **Kurzfazit:** ${summary}\n\n`;

  if (missing.length) {
    t += "❓ **Unklar / fehlt im OCR:**\n";
    t += toBulletList(missing, 5) + "\n";
  }

  t += "🚨 **Kritisch:**\n";
  t += toBulletList(critical, 4) + "\n";

  t += "ℹ️ **Hinweise:**\n";
  t += toBulletList(hints, 4) + "\n";

  t += "🧩 **Formfehler:**\n";
  t += toBulletList(formErrors, 5) + "\n";

  if (relevance.length || risks.length || safeActions.length) {
    t += "🧭 **Bedeutung für dich:**\n";
    t += toBulletList(relevance, 4) + "\n";

    t += "⚠️ **Mögliche Folgen:**\n";
    t += toBulletList(risks, 4) + "\n";

    t += "🛠️ **Sicherer Handlungsspielraum:**\n";
    t += toBulletList(safeActions, 4) + "\n";
  }

  t += "🧠 **Argumentation:**\n";
  if (score !== null) t += `– Score: **${score}/10**\n`;
  if (rationale) t += `– ${rationale}\n`;
  t += "\n";

  t += "✅ **Nächste Schritte:**\n";
  t += toBulletList(steps, 5) + "\n";

  if (confidence !== null) {
    t += `🔒 Confidence: ${(confidence * 100).toFixed(0)}%\n`;
  }

  t += "🛡️ Hinweis: **keine Rechtsberatung** (nur Form/Logik/Argumentation).\n";
  return t;
}

/* =========================================================
   PROMPT BUILDER (Facts sind bindend)
   ========================================================= */
function buildPrompt({ analysis = {}, rawText = "" }) {
  const type = analysis.type || "Unklar";
  const creditor = analysis.creditor || "Unbekannt";
  const subject = analysis.subject || "";
  const date = analysis.date ? String(analysis.date) : "";

  const objections = Array.isArray(analysis.objections)
    ? analysis.objections
    : [];
  const critical = objections
    .filter((o) => o && o.level === "kritisch")
    .map((o) => o.text);
  const hints = objections
    .filter((o) => o && o.level === "hinweis")
    .map((o) => o.text);

  const { facts, missing } = extractFacts(rawText);

  const header =
    `Dokumenttyp: ${type}\n` +
    `Absender: ${creditor}\n` +
    (subject ? `Betreff: ${subject}\n` : "") +
    (date ? `Datum (Engine): ${date}\n` : "");

  const knownIssues =
    "Vorbefunde (Heuristik):\n" +
    "Kritisch:\n" +
    toBulletList(critical, 6) +
    "Hinweise:\n" +
    toBulletList(hints, 6);

  const factBlock =
    "Harte Fakten (deterministisch extrahiert; NICHT widersprechen):\n" +
    JSON.stringify({ facts, missing }, null, 2);

  const doc = safeTrim(rawText, 18000);

  return { header, knownIssues, factBlock, doc, facts, missing };
}

/* =========================================================
   OPENAI CALL (JSON-SCHEMA, FACTS-BINDEND)
   ========================================================= */
async function runOpenAILegalReview({ analysis = {}, rawText = "" } = {}) {
  if (!process.env.OPENAI_API_KEY) {
    return { ok: false, error: "OPENAI_API_KEY fehlt in .env" };
  }
  if (!OpenAI) {
    return {
      ok: false,
      error: "OpenAI SDK nicht installiert. Bitte: npm i openai"
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const { header, knownIssues, factBlock, doc, facts, missing } = buildPrompt({
    analysis,
    rawText
  });

  const schema = {
    name: "legal_review",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        summary: { type: "string" },
        critical_points: { type: "array", items: { type: "string" } },
        hints: { type: "array", items: { type: "string" } },
        form_errors: { type: "array", items: { type: "string" } },
        argumentation_strength: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "number" },
            rationale: { type: "string" }
          },
          required: ["score", "rationale"]
        },
        impact_analysis: {
          type: "object",
          additionalProperties: false,
          properties: {
            relevance: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            safe_actions: { type: "array", items: { type: "string" } }
          },
          required: ["relevance", "risks", "safe_actions"]
        },
        recommended_steps: { type: "array", items: { type: "string" } },
        missing_or_unclear: { type: "array", items: { type: "string" } },
        confidence: { type: "number" }
      },
      required: [
        "summary",
        "critical_points",
        "hints",
        "form_errors",
        "argumentation_strength",
        "impact_analysis",
        "recommended_steps",
        "missing_or_unclear",
        "confidence"
      ]
    }
  };

  const system =
    "Du bist ein extrem vorsichtiger Prüfer für Schreiben in Deutschland. " +
    "Du gibst KEINE Rechtsberatung. " +
    "Du bewertest NUR: Formalien, Plausibilität, Logik, Argumentationsstärke, Bedeutung, Risiken und sichere Handlungsspielräume. " +
    "WICHTIG:\n" +
    "1) NICHTS erfinden (keine Paragrafen, keine Fakten).\n" +
    "2) Die 'Harten Fakten' sind bindend. Du DARFST ihnen NICHT widersprechen.\n" +
    "3) Wenn etwas fehlt: als 'unklar' markieren.\n" +
    "4) Erkläre WARUM etwas relevant ist und WAS man sicher tun kann.";

  const user =
    "Prüfe dieses Schreiben (Scope: Form/Logik/Argumentation) und gib NUR JSON im Schema zurück.\n\n" +
    header +
    "\n" +
    knownIssues +
    "\n" +
    factBlock +
    "\n\n=== Dokumenttext (OCR) ===\n" +
    doc +
    "\n";

  const resp = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_schema", json_schema: schema },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  });

  const content = resp?.choices?.[0]?.message?.content || "";
  if (!content) return { ok: false, error: "Leere OpenAI-Antwort" };

  let parsed = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { ok: false, error: "OpenAI JSON konnte nicht geparst werden" };
  }

  // Deterministische Missing-Liste ergänzen (ohne Duplikate)
  parsed.missing_or_unclear = Array.isArray(parsed.missing_or_unclear)
    ? parsed.missing_or_unclear
    : [];
  for (const m of missing) {
    if (!parsed.missing_or_unclear.includes(m))
      parsed.missing_or_unclear.push(m);
  }

  return { ok: true, data: parsed };
}

/* =========================================================
   PUBLIC HELPER (Cache + Render)
   ========================================================= */
async function buildOpenAIReview({
  analysis = {},
  rawText = "",
  cachedHash = "",
  cachedReview = null
} = {}) {
  const hash = sha256(rawText || "");

  if (cachedHash && cachedReview && cachedHash === hash) {
    return {
      ok: true,
      fromCache: true,
      hash,
      review: cachedReview,
      reportText: renderAIReviewReport(cachedReview)
    };
  }

  const res = await runOpenAILegalReview({ analysis, rawText });

  if (!res.ok) {
    const fallback =
      "🧾 **OpenAI-Vertiefung (Form/Logik)**\n\n" +
      "⚠️ OpenAI-Vertiefung konnte nicht laufen.\n" +
      `Grund: ${res.error}\n` +
      "➡️ Du kannst trotzdem mit den Optionen (1–5) weiterarbeiten.\n";
    return { ok: false, hash, error: res.error, reportText: fallback };
  }

  return {
    ok: true,
    fromCache: false,
    hash,
    review: res.data,
    reportText: renderAIReviewReport(res.data)
  };
}

module.exports = {
  buildOpenAIReview,
  renderAIReviewReport
};