"use strict";

// ============================================================
// Finance – Tax Submodule (v4 FINAL: Emoji- & ID-sicher)
// ============================================================

const { getTaxMenu } = require("./tax-menu");
const { getModuleReaction: ledgerModule } =
  require("../ledger/index");

function getModuleReaction({ state, actionId, documentContext }) {

  const ledgerActions = [
    "5",
    "5️⃣",
    "finance_ledger_open"
  ];

  // ----------------------------------------------------------
  // Ledger immer erreichbar (alle Eingabeformen)
  // ----------------------------------------------------------
  if (ledgerActions.includes(actionId)) {
    return ledgerModule({ state, documentContext });
  }

  // ----------------------------------------------------------
  // Default: Steuer-Menü
  // ----------------------------------------------------------
  return getTaxMenu();
}

module.exports = { getModuleReaction };