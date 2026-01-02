"use strict";

/**
 * Deterministischer Fakten-Extractor (DE)
 * Ziel: Harte Fakten aus OCR ziehen, damit OpenAI niemals "Betrag/Frist fehlt" sagt,
 * wenn sie im Text stehen.
 */

function normalizeSpace(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function parseGermanMoney(str) {
  if (!str) return null;
  // Beispiele: "4.052,98", "4052,98", "4 052,98"
  const clean = String(str)
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(clean);
  if (Number.isFinite(n)) return n;
  return null;
}

function parseGermanDate(str) {
  if (!str) return null;
  // dd.mm.yyyy
  const m = String(str).match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/);
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function findFirstMatch(text, regex) {
  const m = String(text).match(regex);
  return m && m[1] ? m[1].trim() : null;
}

function extractFacts(rawText = "") {
  const text = String(rawText || "");
  const t = text.toLowerCase();

  // Rechnungsnummer (häufig: "RECHNUNGSNUMMER 8369...")
  const invoiceNumber =
    findFirstMatch(text, /RECHNUNGSNUMMER[\s:*]*([0-9]{6,})/i) ||
    findFirstMatch(text, /Rechnungsnummer[\s:*]*([0-9]{6,})/i) ||
    null;

  // Geschäftsnummer / Aktenzeichen (häufig in Kopfzeile)
  const fileRef =
    findFirstMatch(text, /(Geschäftsnummer|Geschaeftsnummer)[\s:*]*([A-Za-z0-9\/\-\.\s]{6,})/i)?.replace(/^(.*?)[\s:*]/, "") ||
    findFirstMatch(text, /(Aktenzeichen)[\s:*]*([A-Za-z0-9\/\-\.\s]{6,})/i)?.replace(/^(.*?)[\s:*]/, "") ||
    null;

  // Ansprechpartner / Sachbearbeiter
  const clerk =
    findFirstMatch(text, /(Sachbearbeiter(?:in)?)[\s:*]*([A-Za-zÄÖÜäöüß\.\- ]{2,})/i)?.replace(/^(.*?)[\s:*]/, "") ||
    findFirstMatch(text, /(Bearbeiter(?:in)?)[\s:*]*([A-Za-zÄÖÜäöüß\.\- ]{2,})/i)?.replace(/^(.*?)[\s:*]/, "") ||
    null;

  // Telefonnummer (Telefon: ...)
  const phone =
    findFirstMatch(text, /Telefon[\s:*]*([0-9\/\-\s]{6,})/i) ||
    findFirstMatch(text, /Tel\.[\s:*]*([0-9\/\-\s]{6,})/i) ||
    null;

  // Telefax
  const fax =
    findFirstMatch(text, /(Telefax|Fax)[\s:*]*([0-9\/\-\s]{6,})/i)?.replace(/^(.*?)[\s:*]/, "") ||
    null;

  // Gesamtbetrag (klassisch: "insgesamt einen Betrag von 4.052,98 EUR")
  let totalAmount = null;
  const totalAmountStr =
    findFirstMatch(
      text,
      /(insgesamt\s+einen\s+Betrag\s+von|Gesamtbetrag|Summe|Betrag)\s*(?:von)?\s*([0-9\.\s]+,[0-9]{2})\s*(?:EUR|€)/i
    ) ||
    findFirstMatch(text, /([0-9\.\s]+,[0-9]{2})\s*(?:EUR|€)\s*(?:zu\s+bezahlen|gesamt)/i);

  if (totalAmountStr) totalAmount = parseGermanMoney(totalAmountStr);

  // Ratenhöhe (z.B. "Raten in Höhe von 150,00 EUR")
  let rateAmount = null;
  const rateAmountStr =
    findFirstMatch(text, /Raten?\s+in\s+Höhe\s+von\s+([0-9\.\s]+,[0-9]{2})\s*(?:EUR|€)/i) ||
    findFirstMatch(text, /Rate[n]?\s*[:]*\s*([0-9\.\s]+,[0-9]{2})\s*(?:EUR|€)/i);

  if (rateAmountStr) rateAmount = parseGermanMoney(rateAmountStr);

  // Frist / Fälligkeitsdatum (z.B. "spätestens am 15.12.2025")
  let dueDate = null;
  const dueDateStr =
    findFirstMatch(text, /spätestens\s+am\s+(\d{1,2}\.\d{1,2}\.\d{4})/i) ||
    findFirstMatch(text, /(bis|fällig\s+am|faellig\s+am)\s+(\d{1,2}\.\d{1,2}\.\d{4})/i)?.match(/\b(\d{1,2}\.\d{1,2}\.\d{4})\b/)?.[1] ||
    null;

  if (dueDateStr) dueDate = parseGermanDate(dueDateStr);

  // Dokumentdatum (Kopf: 14.11.2025)
  let docDate = null;
  const docDateStr = findFirstMatch(text, /\b(\d{1,2}\.\d{1,2}\.\d{4})\b/);
  if (docDateStr) docDate = parseGermanDate(docDateStr);

  const facts = {
    invoice_number: invoiceNumber,
    file_reference: normalizeSpace(fileRef || "") || null,
    clerk: normalizeSpace(clerk || "") || null,
    phone: normalizeSpace(phone || "") || null,
    fax: normalizeSpace(fax || "") || null,
    total_amount_eur: totalAmount,
    rate_amount_eur: rateAmount,
    due_date: dueDate ? dueDate.toISOString().slice(0, 10) : null,
    doc_date: docDate ? docDate.toISOString().slice(0, 10) : null
  };

  // Missing / Unklar-Flags (rein technisch)
  const missing = [];
  if (!facts.total_amount_eur) missing.push("Betrag (gesamt) unklar/nicht erkannt");
  if (!facts.due_date) missing.push("Frist/Fälligkeit unklar/nicht erkannt");
  if (!facts.invoice_number) missing.push("Rechnungsnummer unklar/nicht erkannt");
  if (!facts.file_reference) missing.push("Geschäftsnummer/Aktenzeichen unklar/nicht erkannt");
  if (!facts.clerk) missing.push("Sachbearbeiter unklar/nicht erkannt");
  if (!facts.phone) missing.push("Telefon unklar/nicht erkannt");

  return { facts, missing };
}

module.exports = { extractFacts };