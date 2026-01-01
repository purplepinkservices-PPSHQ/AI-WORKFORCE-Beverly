"use strict";

function detectDeadline(rawText = "") {
  const text = rawText.toLowerCase();

  const dateMatch =
    text.match(/\b(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})\b/);

  if (dateMatch) {
    const d = new Date(
      Number(dateMatch[3]),
      Number(dateMatch[2]) - 1,
      Number(dateMatch[1])
    );
    if (!isNaN(d.getTime())) return build(d, "konkretes Datum");
  }

  const rel =
    text.match(/(innerhalb|binnen)\s+von\s+(\d{1,3})\s+tagen/);
  if (rel) {
    const days = Number(rel[2]);
    const d = new Date();
    d.setDate(d.getDate() + days);
    return build(d, `innerhalb von ${days} Tagen`);
  }

  if (text.includes("frist") || text.includes("spätestens")) {
    return {
      found: true,
      date: null,
      daysLeft: null,
      critical: true,
      hint: "Frist erwähnt, aber nicht eindeutig lesbar"
    };
  }

  return { found: false };
}

function build(date, source) {
  const now = new Date();
  const daysLeft = Math.ceil((date - now) / 86400000);

  return {
    found: true,
    date,
    daysLeft,
    critical: daysLeft <= 7,
    source
  };
}

module.exports = { detectDeadline };