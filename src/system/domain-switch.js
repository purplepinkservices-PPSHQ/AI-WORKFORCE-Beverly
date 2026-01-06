"use strict";

// ============================================================
// Domain Switch Menu
// Liefert NUR sachlichen Text + Actions
// KEINE "Bitte wähle:" Texte!
// ============================================================

function getDomainSwitchMenu() {
  return {
    text:
      "Das Dokument kann auch in einem anderen Bereich sinnvoll sein.",
    actions: [
      "ZU_FINANCE",
      "ZU_LEGAL",
      "ZU_HEALTH",
      "HIER_BLEIBEN"
    ]
  };
}

module.exports = { getDomainSwitchMenu };