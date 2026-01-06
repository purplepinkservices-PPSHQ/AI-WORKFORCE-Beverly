// ============================================================
// Datei: src/ui/menu-renderer.js
// Zweck: Einheitliches Rendern von Menüs
// ============================================================
"use strict";

function renderMenu({ text, actions }) {
  let output = text;

  if (Array.isArray(actions) && actions.length > 0) {
    output += "\n\nBitte wähle:\n";

    actions.forEach((action, index) => {
      const label =
        typeof action === "string"
          ? action
          : action?.label || "Option";

      output += `${index + 1}️⃣ ${label}\n`;
    });
  }

  return { text: output };
}

module.exports = { renderMenu };