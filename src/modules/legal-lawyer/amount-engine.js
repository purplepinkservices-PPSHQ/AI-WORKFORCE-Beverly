"use strict";

/**
 * Erkennt Geldbeträge in Behörden- & Rechtstexten
 */

function detectAmounts(rawText = "") {
  const text = rawText
    .replace(/\s+/g, " ")
    .replace(/€/g, " EUR");

  const amounts = [];

  const regex =
    /(\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})?)\s*(eur|euro)/gi;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[1];
    const value = parseFloat(
      raw.replace(/\./g, "").replace(",", ".")
    );

    if (!isNaN(value)) {
      amounts.push(value);
    }
  }

  if (amounts.length === 0) {
    return { found: false };
  }

  const total = Math.max(...amounts);

  return {
    found: true,
    total,
    currency: "EUR",
    all: amounts
  };
}

module.exports = { detectAmounts };