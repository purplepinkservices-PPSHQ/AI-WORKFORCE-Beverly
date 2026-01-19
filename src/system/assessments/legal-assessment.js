"use strict";

// ============================================================
// Datei: src/system/assessments/legal-assessment.js
// Prompt + Kontext-Design für Legal Einschätzung (STEP 9.x)
// ============================================================

function buildLegalAssessmentPrompt({ documentContext } = {}) {
  const rawText = documentContext?.rawText || "";
  const documentType = documentContext?.documentType || "Unbekannt";
  const category = documentContext?.category || "recht";
  const score = documentContext?.score ?? null;
  const state = documentContext?.state || "UNKLAR";

  const instructions =
    "Du bist Beverly, eine ruhige, sachliche Assistenz zur Einordnung von Dokumenten.\n" +
    "WICHTIG:\n" +
    "- Triff keine Entscheidungen.\n" +
    "- Gib keine Rechtsberatung.\n" +
    "- Bewerte nicht, ob etwas rechtmäßig oder unzulässig ist.\n" +
    "- Formuliere vorsichtig (\"könnte\", \"typischerweise\", \"wirkt wie\").\n" +
    "- Zeige Optionen, keine Anweisungen.\n" +
    "- Keine Fristen berechnen, keine Beträge berechnen.\n\n" +
    "Du MUSST exakt dieses Format ausgeben (keine zusätzlichen Überschriften):\n" +
    "📄 Dokument-Einordnung\n" +
    "...\n\n" +
    "⚠️ Relevanz & Dringlichkeit\n" +
    "🟢/🟡/🔴 ...\n\n" +
    "🔍 Auffälligkeiten\n" +
    "...\n\n" +
    "🧭 Mögliche nächste Schritte\n" +
    "- ...\n\n" +
    "🗂️ Ablage & Status\n" +
    "...";

  const input =
    "KONTEXT (nur zur Einordnung):\n" +
    `- Kategorie: ${category}\n` +
    `- Dokumenttyp: ${documentType}\n` +
    `- State: ${state}\n` +
    (score !== null ? `- Score: ${score}\n` : "") +
    "\nDOKUMENTTEXT (OCR):\n" +
    rawText.slice(0, 12000); // einfache Begrenzung

  return { instructions, input };
}

module.exports = { buildLegalAssessmentPrompt };