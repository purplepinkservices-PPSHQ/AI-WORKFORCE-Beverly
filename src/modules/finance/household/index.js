"use strict";

// ============================================================
// Finance / Household – Entry (v1 + Ledger-Delegation)
// ============================================================
//
// Vertrag:
// - Kein Core
// - Kein Router
// - Keine Automatisierung
// - Nur explizite Delegation
// ============================================================

const { getHouseholdMenu } = require("./household-menu");
const { HOUSEHOLD_HELP_TEXTS } = require("./household-help-texts");
const { getModuleReaction: ledgerModule } =
  require("../ledger/index");

function getModuleReaction({ state, actionId, documentContext }) {

  // ----------------------------------------------------------
  // Explizite Delegation → Ledger
  // ----------------------------------------------------------
  if (actionId === "finance_household_ledger") {
    return ledgerModule({ state, documentContext });
  }

  // ----------------------------------------------------------
  // Haushalt: erklärende Aktionen (keine Automatik)
  // ----------------------------------------------------------
  if (actionId === "finance_household_check") {
    return { text: HOUSEHOLD_HELP_TEXTS.check };
  }

  if (actionId === "finance_household_overview") {
    return { text: HOUSEHOLD_HELP_TEXTS.overview };
  }

  if (actionId === "finance_household_monthly") {
    return { text: HOUSEHOLD_HELP_TEXTS.monthly };
  }

  if (actionId === "finance_household_deadline") {
    return { text: HOUSEHOLD_HELP_TEXTS.deadline };
  }

  // ----------------------------------------------------------
  // Default: Menü anzeigen
  // ----------------------------------------------------------
  return getHouseholdMenu({ state });
}

module.exports = { getModuleReaction };