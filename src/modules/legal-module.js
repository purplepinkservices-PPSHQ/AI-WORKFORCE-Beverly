"use strict";

// ============================================================
// Datei: src/modules/legal-module.js
// Version: v2.4
// Feature: Optionaler Status beim Ablegen (Default = Beverly-Empfehlung)
// ============================================================

const {
  templatePruefbitte,
  templateFristverlaengerung,
  templateRatenzahlung
} = require("./legal/legal-templates");

function safeText(text) {
  return typeof text === "string" && text.trim()
    ? text
    : "⚠️ Interner Hinweis: Keine Anzeige möglich.";
}

/**
 * Beverly-Empfehlung für Status (simple Heuristik, ausbaufähig)
 */
function getBeverlyStatusRecommendation(documentContext) {
  if (!documentContext) {
    return {
      code: "NONE",
      label: "📁 Einfach ablegen",
      reason: "Kein Kontext vorhanden"
    };
  }

  if (documentContext.state === "KRITISCH") {
    return {
      code: "OFFEN",
      label: "🟡 Offen – Handlung empfohlen",
      reason: "kritisches / fristnahes Schreiben"
    };
  }

  if (documentContext.state === "UNSICHER") {
    return {
      code: "OFFEN",
      label: "🟡 Offen – prüfen empfohlen",
      reason: "rechtliche Unsicherheiten"
    };
  }

  return {
    code: "GEPRUEFT",
    label: "✅ Geprüft – aktuell nichts zu tun",
    reason: "keine akute Handlung erkennbar"
  };
}

function getModuleReaction({ state, category, action, documentContext }) {

  // ----------------------------------------------------------
  // INITIAL: Rechtsmenü
  // ----------------------------------------------------------
  if (!action) {
    const intro =
      state === "UNSICHER" || state === "UNKLAR"
        ? "⚠️ Rechtlich erkannt, aber mit Unsicherheiten.\n\nWas möchtest du tun?"
        : "⚖️ Rechtlich relevantes Dokument erkannt.\n\nWas möchtest du tun?";

    return {
      text: safeText(intro),
      actions: [
        { id: "LEGAL_ASSESS_MENU", label: "Einschätzung + nächste Schritte" },
        { id: "LEGAL_REPLY", label: "Antwort verfassen" },
        { id: "LEGAL_EXPLAIN", label: "Dokument einfach erklärt" },
        { id: "LEGAL_CHECK", label: "Dokument prüfen" },
        { id: "LEGAL_STORE_STATUS", label: "📁 Dokument jetzt ablegen" },
        { id: "DOMAIN_SWITCH", label: "Anderen Bereich wählen" }
      ]
    };
  }

  // ----------------------------------------------------------
  // STATUS SETZEN (OPTIONAL, DEFAULT = BEVERLY)
  // ----------------------------------------------------------
  if (action === "LEGAL_STORE_STATUS") {
    const recommendation = getBeverlyStatusRecommendation(documentContext);

    return {
      text: safeText(
        "🔖 Status beim Ablegen\n\n" +
        `**Beverly empfiehlt:**\n${recommendation.label}\n\n` +
        `*Grund:* ${recommendation.reason}\n\n` +
        "Du kannst den Status übernehmen oder selbst wählen.\n" +
        "Wenn du nichts auswählst, wird die Empfehlung übernommen."
      ),
      actions: [
        { id: "LEGAL_STORE_ONLY", label: `✔️ Übernehmen (${recommendation.label})` },
        { id: "LEGAL_STORE_OPEN", label: "🟡 Offen – ich kümmere mich später" },
        { id: "LEGAL_STORE_CHECKED", label: "✅ Geprüft – aktuell nichts zu tun" },
        { id: "LEGAL_STORE_DONE", label: "✉️ Reagiert – Antwort erfolgt" },
        { id: "LEGAL_BACK_TO_MENU", label: "↩️ Zurück" }
      ]
    };
  }

  // ----------------------------------------------------------
  // STATUS-AKTIONEN → Alle führen zu STORE (Router regelt)
  // ----------------------------------------------------------
  if (
    action === "LEGAL_STORE_ONLY" ||
    action === "LEGAL_STORE_OPEN" ||
    action === "LEGAL_STORE_CHECKED" ||
    action === "LEGAL_STORE_DONE"
  ) {
    // Status wird im documentContext abgelegt (für storeDocument / Audit)
    if (documentContext) {
      documentContext.status =
        action === "LEGAL_STORE_OPEN"
          ? "OFFEN"
          : action === "LEGAL_STORE_CHECKED"
          ? "GEPRUEFT"
          : action === "LEGAL_STORE_DONE"
          ? "REAGIERT"
          : "BEVERLY_DEFAULT";
    }

    return {
      text: safeText("📁 Dokument wird jetzt abgelegt …"),
      actions: [] // Router übernimmt jetzt
    };
  }

  // ----------------------------------------------------------
  // SUBMENU: Einschätzung
  // ----------------------------------------------------------
  if (action === "LEGAL_ASSESS_MENU") {
    return {
      text: safeText(
        "🧠 Einschätzung (optional)\n\n" +
        "Du kannst dir eine rechtliche Einordnung anzeigen lassen\n" +
        "oder direkt eine Copy-Paste-Vorlage nutzen.\n\n" +
        "Was möchtest du?"
      ),
      actions: [
        { id: "LEGAL_ASSESS_PREPARE", label: "Einschätzung vorbereiten" },
        { id: "LEGAL_TEMPLATE_REVIEW", label: "Vorlage: Prüfbitte" },
        { id: "LEGAL_TEMPLATE_EXTEND", label: "Vorlage: Fristverlängerung" },
        { id: "LEGAL_TEMPLATE_PLAN", label: "Vorlage: Ratenzahlung" },
        { id: "LEGAL_STORE_STATUS", label: "📁 Dokument jetzt ablegen" },
        { id: "DOMAIN_SWITCH", label: "Anderen Bereich wählen" }
      ]
    };
  }

  // ----------------------------------------------------------
  // PLACEHOLDER: Einschätzung vorbereiten / anzeigen
  // ----------------------------------------------------------
  if (action === "LEGAL_ASSESS_PREPARE") {
    return {
      text: safeText(
        "🧠 Einschätzung wird vorbereitet.\n\n" +
        "• Dokumenttyp\n• Dringlichkeit\n• nächste Schritte\n\n" +
        "👉 Im nächsten Schritt anzeigen."
      ),
      actions: [
        { id: "LEGAL_ASSESS_SHOW", label: "Einschätzung anzeigen" },
        { id: "LEGAL_STORE_STATUS", label: "📁 Dokument jetzt ablegen" }
      ]
    };
  }

  if (action === "LEGAL_ASSESS_SHOW") {
    return {
      text: safeText(
        "🧠 Rechtliche Ersteinschätzung\n\n" +
        "📄 Behördliches / rechtlich relevantes Schreiben\n" +
        "⚠️ Fristen / Reaktion prüfen empfohlen\n\n" +
        "ℹ️ Keine Rechtsberatung."
      ),
      actions: [
        { id: "LEGAL_ASSESS_MENU", label: "Vorlagen & Optionen" },
        { id: "LEGAL_STORE_STATUS", label: "📁 Dokument jetzt ablegen" }
      ]
    };
  }

  // ----------------------------------------------------------
  // VORLAGEN
  // ----------------------------------------------------------
  if (action === "LEGAL_TEMPLATE_REVIEW") {
    return {
      text: safeText("✍️ Copy-Paste Vorlage – Prüfbitte\n\n" + templatePruefbitte()),
      actions: [
        { id: "LEGAL_ASSESS_MENU", label: "Zurück" },
        { id: "LEGAL_STORE_STATUS", label: "📁 Dokument jetzt ablegen" }
      ]
    };
  }

  if (action === "LEGAL_TEMPLATE_EXTEND") {
    return {
      text: safeText("✍️ Copy-Paste Vorlage – Fristverlängerung\n\n" + templateFristverlaengerung()),
      actions: [
        { id: "LEGAL_ASSESS_MENU", label: "Zurück" },
        { id: "LEGAL_STORE_STATUS", label: "📁 Dokument jetzt ablegen" }
      ]
    };
  }

  if (action === "LEGAL_TEMPLATE_PLAN") {
    return {
      text: safeText("✍️ Copy-Paste Vorlage – Ratenzahlung\n\n" + templateRatenzahlung()),
      actions: [
        { id: "LEGAL_ASSESS_MENU", label: "Zurück" },
        { id: "LEGAL_STORE_STATUS", label: "📁 Dokument jetzt ablegen" }
      ]
    };
  }

  if (action === "LEGAL_BACK_TO_MENU") {
    return getModuleReaction({ state, category });
  }

  return {
    text: safeText("❓ Diese Aktion ist aktuell nicht verfügbar."),
    actions: []
  };
}

module.exports = { getModuleReaction };