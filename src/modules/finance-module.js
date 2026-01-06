"use strict";

// ============================================================
// Finance Module Dispatcher
// ============================================================

const { getHouseholdMenu } = require("./finance/household");
const { getTaxMenu } = require("./finance/tax");
const { getInsuranceMenu } = require("./finance/insurance");

function getModuleReaction({ state, category }) {
  // ------------------------------------------------------------
  // FINANCE GATE
  // ------------------------------------------------------------
  if (category === "versicherung") {
    return {
      text: "💼 Finanzdokument erkannt (Versicherung).\n\nWas möchtest du tun?",
      actions: [
        { id: "finance_open_insurance", label: "Zum Versicherungsmenü" },
        { id: "finance_store_only", label: "Dokument nur ablegen" },
        { id: "finance_open_legal", label: "Rechtlich prüfen" }
      ]
    };
  }

  if (category === "steuer") {
    return {
      text: "💼 Finanzdokument erkannt (Steuer).\n\nWas möchtest du tun?",
      actions: [
        { id: "finance_open_tax", label: "Zum Steuermenü" },
        { id: "finance_store_only", label: "Dokument nur ablegen" }
      ]
    };
  }

  if (category === "haushalt") {
    return {
      text: "💼 Finanzdokument erkannt (Haushalt).\n\nWas möchtest du tun?",
      actions: [
        { id: "finance_open_household", label: "Zum Haushaltsmenü" },
        { id: "finance_store_only", label: "Dokument nur ablegen" }
      ]
    };
  }

  // ------------------------------------------------------------
  // FALLBACK
  // ------------------------------------------------------------
  return {
    text: "💼 Finanzdokument erkannt.\n\nWas möchtest du tun?",
    actions: [
      { id: "finance_store_only", label: "Dokument nur ablegen" }
    ]
  };
}

module.exports = { getModuleReaction };