"use strict";

// ============================================================
// Menu Renderer
// Phase 3 – UI-Rendering (ohne Fachlogik)
// ============================================================

function renderMenu({ state, category, module, text, actions }) {
  if (!actions || actions.length === 0) {
    return { text, actions: [] };
  }

  let numbered = actions
    .map((a, i) => `${i + 1}️⃣ ${label(a)}`)
    .join("\n");

  return {
    text: `${text}\nBitte wähle:\n${numbered}`,
    actions
  };
}

function label(action) {
  switch (action) {
    case "PRUEFEN":
      return "Prüfen & Empfehlung";
    case "ABLEGEN":
      return "Nur ablegen";
    case "TERMIN":
      return "Termin / Frist setzen";
    case "VERFOLGEN":
      return "Verfolgen";
    case "ANTWORT":
      return "Antwort schreiben";
    default:
      return action;
  }
}

module.exports = { renderMenu };