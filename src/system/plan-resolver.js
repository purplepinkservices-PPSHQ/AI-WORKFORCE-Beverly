// ============================================================
// Datei: src/system/plan-resolver.js
// ============================================================
"use strict";

function resolvePlan(userId) {
  // aktuell: alles Free
  // später: DB / Payment / License
  return {
    plan: "FREE",
    allowedModules: ["basic-storage"],
    storageScope: "free"
  };
}

module.exports = { resolvePlan };