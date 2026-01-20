"use strict";

const { getLedgerMenu } = require("./ledger-menu");
const { handleLedgerAction } = require("./ledger-actions");

function getModuleReaction({ state, actionId, documentContext }) {
  if (actionId) {
    return handleLedgerAction({ state, actionId, documentContext });
  }
  return getLedgerMenu({ state, documentContext });
}

module.exports = {
  getModuleReaction,
};