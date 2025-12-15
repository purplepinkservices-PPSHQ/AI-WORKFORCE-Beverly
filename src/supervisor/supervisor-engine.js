// src/supervisor/supervisor-engine.js

/**
 * Phase D – Supervisor Engine (Stufe 1)
 * - bewertet Memories nach Kritikalität
 * - setzt Supervisor-Flag
 * - erzwingt Fokus bei relevanten Zuständen
 * - KEINE Empfehlungen, NUR Markierung
 */

function evaluateSupervisorState(memory) {
    const result = {
        supervisorFlag: false,
        aktivierterKontext: true,
        prioritaet: memory.prioritaet || "Mittel",
        kontextSignal: memory.kontextSignal || "Fortsetzen"
    };

    // ------------------------------------------------------------
    // HARTE ESKALATION
    // ------------------------------------------------------------
    if (
        memory.kontextSignal === "Fehlerzustand" ||
        memory.prioritaet === "Kritisch"
    ) {
        result.supervisorFlag = true;
        result.prioritaet = "Kritisch";
        result.kontextSignal = "Fehlerzustand";
        result.aktivierterKontext = true;
        return result;
    }

    // ------------------------------------------------------------
    // HOHE RELEVANZ
    // ------------------------------------------------------------
    if (
        memory.kontextMatching >= 80 ||
        memory.gewichtung >= 8
    ) {
        result.supervisorFlag = true;
        result.prioritaet = "Hoch";
        result.aktivierterKontext = true;
        return result;
    }

    // ------------------------------------------------------------
    // ABSCHLUSS → DEAKTIVIEREN
    // ------------------------------------------------------------
    if (
        memory.kontextSignal === "Abschluss" ||
        memory.fortschritt >= 100
    ) {
        result.supervisorFlag = false;
        result.aktivierterKontext = false;
        result.prioritaet = "Niedrig";
        return result;
    }

    return result;
}

module.exports = { evaluateSupervisorState };
