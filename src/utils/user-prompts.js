"use strict";

// Placeholder für User-Auswahl

async function askUserForCategory(userId, candidates) {
  console.log(
    `[UserPrompt → ${userId}] Bitte Kategorie wählen:`,
    candidates || "frei"
  );
}

module.exports = { askUserForCategory };
