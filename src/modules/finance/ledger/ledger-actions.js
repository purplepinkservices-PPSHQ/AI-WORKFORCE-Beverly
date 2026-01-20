"use strict";

const { buildLedgerContext } = require("./ledger-context");
const { texts } = require("./ledger-texts");

function handleLedgerAction({ documentContext, actionId }) {
  const ctx = buildLedgerContext({ documentContext });

  switch (actionId) {
    case "LEDGER_MONTH":
      return { text: texts.month(ctx) };

    case "LEDGER_CATEGORY":
      return { text: texts.category(ctx) };

    case "LEDGER_SUMMARY":
      return { text: texts.summary(ctx) };

    case "LEDGER_DOC":
      return { text: texts.document(ctx) };

    case "LEDGER_HELP":
      return { text: texts.help() };

    case "SWITCH_DOMAIN":
      return { switchDomain: true };

    default:
      return { text: "Aktion nicht erkannt." };
  }
}

module.exports = {
  handleLedgerAction,
};