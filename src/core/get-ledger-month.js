"use strict";

const { findLedgerMonthByKey } = require("../integrations/notion/notion-ledger");

function monthKeyFromDate(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

async function getLedgerMonthId(dateStr) {
  const key = monthKeyFromDate(dateStr);
  return findLedgerMonthByKey(key);
}

module.exports = {
  getLedgerMonthId
};