// ============================================================
// Datei: src/ui/menu-renderer.js
// ============================================================
"use strict";

// ============================================================
// Einheitlicher Menü-Renderer
// ============================================================
// Regel:
// - Text kommt vom Modul
// - Renderer nummeriert nur die Actions
// - KEINE doppelte "Bitte wähle"-Ausgabe
// ============================================================

function renderMenu({ text, actions }) {
  let output = "";

  // Haupttext immer einmal ausgeben
  if (text) {
    output += text.trim() + "\n\n";
  }

  if (Array.isArray(actions) && actions.length > 0) {
    actions.forEach((action, index) => {
      output += `${index + 1}️⃣ ${action.label}\n`;
    });
  }

  return {
    text: output.trim()
  };
}

module.exports = { renderMenu };