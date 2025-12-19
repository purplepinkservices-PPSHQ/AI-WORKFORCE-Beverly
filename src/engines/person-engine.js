"use strict";

// ============================================================
// Person-Engine (Nachname + Geschlecht)
// Datei: src/engines/person-engine.js
//
// Ziel:
// - Geschlecht: Frau | Mann | Firma | Wohngemeinschaft | Divers
// - Nachname: robust aus OCR-Text (mehrzeilig, unsauber)
// - Fokus: Empfänger/Adressat links oben ("Frau" -> nächste Zeile)
// - Fallback: Heuristik (Name in den ersten Zeilen)
// ============================================================

function normalizeLine(s = "") {
  return String(s)
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyAddressLine(line) {
  const l = line.toLowerCase();
  return (
    l.includes("straße") ||
    l.includes("str.") ||
    l.includes("weg") ||
    l.includes("platz") ||
    l.includes("allee") ||
    l.includes("gasse") ||
    l.includes("hausnr") ||
    l.includes("plz") ||
    /\b\d{5}\b/.test(l) || // deutsche PLZ
    /\b\d{1,3}[a-z]?\b/i.test(l) && (l.includes("str") || l.includes("straße")) ||
    l.includes("tel") ||
    l.includes("telefon") ||
    l.includes("fax") ||
    l.includes("email") ||
    l.includes("@")
  );
}

function looksLikeNameLine(line) {
  // Beispiel: "Silvia Wehner demonstrate"
  // Wir wollen: 2 Wörter, beide mit Großbuchstaben startend, ohne typische Firmenwörter
  const l = normalizeLine(line);
  if (!l || l.length < 5) return false;

  const bad = l.toLowerCase();
  if (
    bad.includes("gmbh") ||
    bad.includes("ag") ||
    bad.includes("kg") ||
    bad.includes("ug") ||
    bad.includes("praxis") ||
    bad.includes("zentrum") ||
    bad.includes("dental") ||
    bad.includes("technik") ||
    bad.includes("bank") ||
    bad.includes("sparkasse") ||
    bad.includes("rechnung") ||
    bad.includes("kundennr") ||
    bad.includes("rechnungsnr") ||
    bad.includes("iban") ||
    bad.includes("bic")
  ) {
    return false;
  }

  if (isLikelyAddressLine(l)) return false;

  const parts = l.split(" ").filter(Boolean);
  if (parts.length < 2) return false;

  // akzeptiere max 4 Teile (Vorname(n) + Nachname)
  if (parts.length > 4) return false;

  // Alle Teile müssen halbwegs "name-ish" sein
  const nameLike = parts.every(p => /^[A-ZÄÖÜ][a-zäöüß\-']{1,}$/u.test(p));
  return nameLike;
}

function extractLastnameFromNameLine(line) {
  const parts = normalizeLine(line).split(" ").filter(Boolean);
  if (parts.length === 0) return null;
  return parts[parts.length - 1];
}

function detectFromMarker(lines) {
  // Marker-Strategie:
  // - "Frau" (allein in Zeile) -> nächste Zeile Name
  // - "Herr" (allein) -> nächste Zeile Name
  // - "Firma" -> nächste Zeile oder gleiche Zeile Firmenname (aber Nachname = Unbekannt)
  // - "Wohngemeinschaft" / "WG" / "Gemeinschaft" -> Kategorie WG
  for (let i = 0; i < lines.length; i++) {
    const line = normalizeLine(lines[i]);
    const low = line.toLowerCase();

    // WG / Gemeinschaft zuerst (weil oft als Block steht)
    if (/\b(wg|wohngemeinschaft|gemeinschaft)\b/i.test(line)) {
      return {
        gender: "Wohngemeinschaft",
        lastname: "Gemeinschaft",
        confidence: 0.85,
        source: "Marker:WG"
      };
    }

    // Frau/Herr als eigene Zeile
    if (low === "frau" || low.startsWith("frau ")) {
      // Frau Silvia Wehner (gleiche Zeile)
      if (low.startsWith("frau ") && line.length > 6) {
        const namePart = line.slice(5).trim();
        if (looksLikeNameLine(namePart)) {
          return {
            gender: "Frau",
            lastname: extractLastnameFromNameLine(namePart) || "Unbekannt",
            confidence: 0.92,
            source: "Marker:FrauInline"
          };
        }
      }

      // Frau (allein) -> nächste Zeile
      const next = normalizeLine(lines[i + 1] || "");
      if (looksLikeNameLine(next)) {
        return {
          gender: "Frau",
          lastname: extractLastnameFromNameLine(next) || "Unbekannt",
          confidence: 0.92,
          source: "Marker:FrauNextLine"
        };
      }

      // Fallback: 2 Zeilen weiter (OCR verrutscht)
      const next2 = normalizeLine(lines[i + 2] || "");
      if (looksLikeNameLine(next2)) {
        return {
          gender: "Frau",
          lastname: extractLastnameFromNameLine(next2) || "Unbekannt",
          confidence: 0.82,
          source: "Marker:FrauNext2"
        };
      }
    }

    if (low === "herr" || low.startsWith("herr ")) {
      if (low.startsWith("herr ") && line.length > 6) {
        const namePart = line.slice(5).trim();
        if (looksLikeNameLine(namePart)) {
          return {
            gender: "Mann",
            lastname: extractLastnameFromNameLine(namePart) || "Unbekannt",
            confidence: 0.92,
            source: "Marker:HerrInline"
          };
        }
      }

      const next = normalizeLine(lines[i + 1] || "");
      if (looksLikeNameLine(next)) {
        return {
          gender: "Mann",
          lastname: extractLastnameFromNameLine(next) || "Unbekannt",
          confidence: 0.92,
          source: "Marker:HerrNextLine"
        };
      }

      const next2 = normalizeLine(lines[i + 2] || "");
      if (looksLikeNameLine(next2)) {
        return {
          gender: "Mann",
          lastname: extractLastnameFromNameLine(next2) || "Unbekannt",
          confidence: 0.82,
          source: "Marker:HerrNext2"
        };
      }
    }

    // Firma / Unternehmen
    if (/\bfirma\b/i.test(line) || /\bunternehmen\b/i.test(line)) {
      return {
        gender: "Firma",
        lastname: "Firma",
        confidence: 0.8,
        source: "Marker:Firma"
      };
    }
  }

  return null;
}

function detectFromTopHeuristic(lines) {
  // Heuristik: in den ersten Zeilen (links oben) steht oft Empfängername
  // Wir nehmen die erste plausible Namenszeile, die keine Adresse ist.
  for (const line of lines) {
    const l = normalizeLine(line);
    if (looksLikeNameLine(l)) {
      return {
        gender: "Divers",
        lastname: extractLastnameFromNameLine(l) || "Unbekannt",
        confidence: 0.72,
        source: "Heuristik:TopNameLine"
      };
    }
  }
  return null;
}

function detectPerson(rawText = "") {
  const text = String(rawText || "");
  const allLines = text.split(/\r?\n/).map(normalizeLine).filter(Boolean);

  // Wir schauen bewusst nur in den Kopfbereich
  const headLines = allLines.slice(0, 35);

  // 1) Marker-Strategie (Frau/Herr/WG)
  const markerHit = detectFromMarker(headLines);
  if (markerHit) return markerHit;

  // 2) Heuristik (erste plausible Namenszeile)
  const heuristicHit = detectFromTopHeuristic(headLines);
  if (heuristicHit) return heuristicHit;

  // 3) Fallback
  return {
    gender: "Divers",
    lastname: "Unbekannt",
    confidence: 0.55,
    source: "Fallback"
  };
}

module.exports = { detectPerson };