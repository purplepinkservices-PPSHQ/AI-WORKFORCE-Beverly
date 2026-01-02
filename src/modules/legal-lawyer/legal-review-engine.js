// ============================================================
// Datei: src/modules/legal-lawyer/legal-review-engine.js
// ============================================================
"use strict";

/**
 * Baut einen strukturierten Prüfbericht (Option 6).
 * KEIN Versand, nur Output im Chat.
 * Nutzt NUR lastAnalysis (Frist/Betrag/Einwände/Typ).
 */

function formatDate(d) {
  try {
    if (d instanceof Date) return d.toLocaleDateString("de-DE");
    const dd = new Date(d);
    if (!isNaN(dd.getTime())) return dd.toLocaleDateString("de-DE");
    return String(d);
  } catch {
    return String(d);
  }
}

function formatMoney(n) {
  try {
    return Number(n).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } catch {
    return String(n);
  }
}

function splitObjections(objections = []) {
  const list = Array.isArray(objections) ? objections : [];
  const critical = list.filter((o) => o && o.level === "kritisch");
  const hints = list.filter((o) => o && o.level === "hinweis");
  return { critical, hints };
}

function addDerivedPoints(lastAnalysis = {}, critical = [], hints = []) {
  const dl = lastAnalysis.deadline;

  // Frist abgelaufen / sehr kurz
  if (dl?.found && typeof dl.daysLeft === "number") {
    if (dl.daysLeft < 0) {
      critical.push({
        level: "kritisch",
        text: `Frist scheint bereits abgelaufen (vor ${Math.abs(dl.daysLeft)} Tagen)`
      });
    } else if (dl.daysLeft <= 7) {
      critical.push({
        level: "kritisch",
        text: "Sehr kurze Frist – sofort reagieren (Frist wahren!)"
      });
    }
  }

  // Betrag fehlt / unklar
  if (!lastAnalysis.amounts?.found) {
    hints.push({
      level: "hinweis",
      text: "Kein eindeutiger Betrag erkannt – Forderungshöhe/Begründung prüfen"
    });
  }

  // Typ-spezifische Hinweise (neutral)
  const type = lastAnalysis.type || "Unklar";

  if (type === "Bescheid") {
    hints.push({
      level: "hinweis",
      text: "Bei Bescheiden: Rechtsbehelfsbelehrung/Widerspruchsfrist im Schreiben prüfen"
    });
  }

  if (type === "Zwangsvollstreckung") {
    hints.push({
      level: "hinweis",
      text: "Bei Vollstreckung: Titel/Grundlage, Zustellung und Kostenaufstellung prüfen"
    });
  }

  if (type === "Mahnschreiben") {
    hints.push({
      level: "hinweis",
      text: "Bei Mahnungen: Forderungsaufstellung, Ursprung (Vertrag/Rechnung) und Mahnkosten prüfen"
    });
  }

  if (type === "Anhörung") {
    hints.push({
      level: "hinweis",
      text: "Bei Anhörung: Frist wahren und ggf. Akteneinsicht/Begründung anfordern"
    });
  }

  if (type === "Pfändung") {
    hints.push({
      level: "hinweis",
      text: "Bei Pfändung: Betrag/Gläubigerdaten prüfen und ggf. P-Konto/Schutzmöglichkeiten klären"
    });
  }

  return { critical, hints };
}

function buildSummary(lastAnalysis = {}) {
  let t = "";

  t += `📄 **Dokumenttyp:** ${lastAnalysis.type || "Unklar"}\n`;
  t += `🏛️ **Absender:** ${lastAnalysis.creditor || "Unbekannt"}\n`;

  if (lastAnalysis.date) {
    t += `🗓️ **Dokumentdatum:** ${formatDate(lastAnalysis.date)}\n`;
  }

  // Frist
  const dl = lastAnalysis.deadline;
  if (dl?.found) {
    if (dl.date) {
      const dateStr = formatDate(dl.date);
      if (typeof dl.daysLeft === "number") {
        if (dl.daysLeft < 0) {
          t += `⏰ **Frist:** ${dateStr} (abgelaufen vor ${Math.abs(dl.daysLeft)} Tagen)\n`;
        } else {
          t += `⏰ **Frist:** ${dateStr} (noch ${dl.daysLeft} Tage)\n`;
        }
      } else {
        t += `⏰ **Frist:** ${dateStr}\n`;
      }
    } else if (dl.hint) {
      t += `⏰ **Frist:** ${dl.hint}\n`;
    } else {
      t += "⏰ **Frist:** Frist erkannt, aber Datum unklar\n";
    }
  } else {
    t += "⏰ **Frist:** Keine klare Frist erkannt\n";
  }

  // Betrag
  const am = lastAnalysis.amounts;
  if (am?.found) {
    t += `💰 **Betrag:** ${formatMoney(am.total)} EUR\n`;
  } else {
    t += "💰 **Betrag:** Kein klarer Betrag erkannt\n";
  }

  return t.trim();
}

function buildListSection(title, items = []) {
  if (!items.length) return `${title}\n– Keine\n`;

  let t = `${title}\n`;
  items.forEach((o) => {
    t += `– ${o.text}\n`;
  });
  return t;
}

function buildNextSteps(lastAnalysis = {}, criticalCount = 0) {
  const steps = [];

  steps.push("Frist wahren: Wenn unklar/kurz, vorsorglich fristwahrend reagieren (z. B. Prüfung + Fristverlängerung anfragen).");
  steps.push("Belege sichern: Schreiben/Anlagen, Zustellnachweis, Aktenzeichen, Betragsaufstellung sammeln.");
  steps.push("Aufschlüsselung anfordern, wenn Betrag/Kosten nicht nachvollziehbar sind.");

  const type = lastAnalysis.type || "Unklar";

  if (type === "Bescheid") {
    steps.push("Bescheid: Rechtsbehelfsbelehrung prüfen (Widerspruchsfrist/Adresse/Form).");
  }
  if (type === "Zwangsvollstreckung") {
    steps.push("Vollstreckung: Grundlage/Titel, Zustellung, Kostenpositionen und Zuständigkeit prüfen.");
  }
  if (type === "Mahnschreiben") {
    steps.push("Mahnung: Ursprung der Forderung prüfen (Vertrag/Rechnung) und ggf. schriftlich Nachweise anfordern.");
  }
  if (type === "Anhörung") {
    steps.push("Anhörung: Sachverhalt kurz strukturieren, ggf. Akteneinsicht/Begründung anfordern, fristgerecht Stellung nehmen.");
  }
  if (type === "Pfändung") {
    steps.push("Pfändung: Bank/P-Konto-Thema prüfen, Pfändungsfreigrenzen/Schutzmöglichkeiten klären, Forderungsdaten abgleichen.");
  }

  if (criticalCount > 0) {
    steps.unshift("🚨 Priorität: Erst die kritischen Punkte adressieren, dann Details nachreichen.");
  }

  let t = "🧭 **Empfohlene nächste Schritte**\n";
  steps.forEach((s) => (t += `– ${s}\n`));
  return t;
}

function dedupe(items = []) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = String(it?.text || "").trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ level: it.level || "hinweis", text: it.text });
  }
  return out;
}

/**
 * Hauptfunktion: liefert den Report als String
 */
function buildLegalReviewReport(lastAnalysis = {}) {
  const { critical: baseCritical, hints: baseHints } = splitObjections(
    lastAnalysis.objections || []
  );

  const enriched = addDerivedPoints(
    lastAnalysis,
    [...baseCritical],
    [...baseHints]
  );

  const critical = dedupe(enriched.critical);
  const hints = dedupe(enriched.hints);

  let report = "";
  report += "📑 **Prüfbericht**\n\n";
  report += "🧾 **Zusammenfassung**\n";
  report += buildSummary(lastAnalysis) + "\n\n";

  report += buildListSection("🚨 **Kritische Punkte**", critical) + "\n";
  report += buildListSection("ℹ️ **Hinweise**", hints) + "\n";
  report += buildNextSteps(lastAnalysis, critical.length);

  return report.trim();
}

module.exports = {
  buildLegalReviewReport
};