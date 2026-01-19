"use strict";

// ============================================================
// Legal – Entry (v1 mit Actions)
// ============================================================

const { getLegalMenu } = require("./legal-menu");
const { handleLegalAction } = require("./legal-actions");

function getModuleReaction({ state, actionId, documentContext }) {

  // Aktion wurde gewählt
  if (actionId) {
    return handleLegalAction({ actionId, documentContext });
  }

  // Standard: Menü anzeigen
  return getLegalMenu({ state });
}

module.exports = { getModuleReaction };