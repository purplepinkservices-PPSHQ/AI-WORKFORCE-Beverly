"use strict";

// ============================================================
// Domain Switch Menu
// Einheitlich mit allen anderen Menüs
// ============================================================

function getDomainSwitchMenu() {
  return {
    text:
      "Das Dokument kann auch in einem anderen Bereich sinnvoll sein.",
    actions: [
      { id: "ZU_FINANCE", label: "Zu Finanzen wechseln" },
      { id: "ZU_LEGAL", label: "Zu Recht wechseln" },
      { id: "ZU_HEALTH", label: "Zu Gesundheit wechseln" },
      { id: "HIER_BLEIBEN", label: "Hier bleiben" }
    ]
  };
}

module.exports = { getDomainSwitchMenu };