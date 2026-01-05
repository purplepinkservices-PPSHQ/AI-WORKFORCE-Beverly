"use strict";

// ============================================================
// Document Score Engine
// Phase 2 ONLY
// Bestimmt Zustand + Confidence
// ============================================================

function scoreDocument({ type, category }) {
  // ----------------------------------------------------------
  // HARTE REGEL: Kassenbon ist IMMER SICHER
  // ----------------------------------------------------------
  if (type?.type === "Kassenbon") {
    return {
      state: "SICHER",
      score: 0.95
    };
  }

  // ----------------------------------------------------------
  // Defaults
  // ----------------------------------------------------------
  let state = "UNKLAR";
  let score = 0.3;

  // ----------------------------------------------------------
  // SICHER (beide sicher)
  // ----------------------------------------------------------
  if (
    type?.confidence >= 0.8 &&
    category?.confidence >= 0.8
  ) {
    state = "SICHER";
    score = Math.min(
      1,
      (type.confidence + category.confidence) / 2
    );
  }

  // ----------------------------------------------------------
  // UNSICHER (mindestens eines brauchbar)
  // ----------------------------------------------------------
  else if (
    type?.confidence >= 0.5 ||
    category?.confidence >= 0.5
  ) {
    state = "UNSICHER";
    score = Math.max(
      type?.confidence || 0,
      category?.confidence || 0
    );
  }

  // ----------------------------------------------------------
  // Rückgabe (VERTRAG)
  // ----------------------------------------------------------
  return {
    state,
    score
  };
}

module.exports = { scoreDocument };