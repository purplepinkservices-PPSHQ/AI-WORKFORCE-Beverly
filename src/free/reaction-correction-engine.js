// ============================================================
// Beverly FREE – Reaktionskorrektur Engine
// Datei: src/free/reaction-correction-engine.js
// ============================================================

"use strict";

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const {
  createDropboxFolderIfMissing,
  uploadFileToDropbox,
  getDropboxClient
} = require("../cloud/dropbox");

const state = require("../system/state");

// ------------------------------------------------------------
// THEMEN
// ------------------------------------------------------------
const CATEGORIES = [
  "Behörden",
  "Steuer",
  "Versicherung",
  "Bank",
  "Gesundheit",
  "Haus & Wohnen",
  "Einkommen & Beruf",
  "Sonstiges"
];

// ------------------------------------------------------------
// START KORREKTUR
// ------------------------------------------------------------
async function askForCorrection(message, meta) {
  const userId = message.author.id;

  // Meta im State sichern
  state.setUserData(userId, {
    correction: meta
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("bev_ok")
      .setLabel("✅ Passt")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("bev_move")
      .setLabel("🔄 Verschieben")
      .setStyle(ButtonStyle.Secondary)
  );

  await message.reply({
    content: `🧠 Ich habe das als **${meta.category}** erkannt – passt das?`,
    components: [row]
  });
}

// ------------------------------------------------------------
// HANDLE BUTTONS
// ------------------------------------------------------------
async function handleCorrectionInteraction(interaction) {
  const userId = interaction.user.id;
  const data = state.getUserData(userId)?.correction;

  if (!data) {
    await interaction.reply({
      content: "⚠️ Keine aktive Korrektur.",
      ephemeral: true
    });
    return;
  }

  // ✅ OK
  if (interaction.customId === "bev_ok") {
    state.clearUserData(userId);
    await interaction.update({
      content: "✅ Alles klar. Ablage bleibt so 👍",
      components: []
    });
    return;
  }

  // 🔄 VERSCHIEBEN → Kategorie-Auswahl
  if (interaction.customId === "bev_move") {
    const rows = [];

    for (let i = 0; i < CATEGORIES.length; i += 2) {
      const row = new ActionRowBuilder();
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`bev_cat_${CATEGORIES[i]}`)
          .setLabel(CATEGORIES[i])
          .setStyle(ButtonStyle.Primary)
      );

      if (CATEGORIES[i + 1]) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`bev_cat_${CATEGORIES[i + 1]}`)
            .setLabel(CATEGORIES[i + 1])
            .setStyle(ButtonStyle.Primary)
        );
      }

      rows.push(row);
    }

    await interaction.update({
      content: "📂 Wohin soll ich das verschieben?",
      components: rows
    });
    return;
  }

  // 📂 KONKRETE KATEGORIE
  if (interaction.customId.startsWith("bev_cat_")) {
    const newCategory = interaction.customId.replace("bev_cat_", "");

    await moveDropboxFile(data, newCategory);

    state.clearUserData(userId);

    await interaction.update({
      content: `✅ Erledigt. Datei liegt jetzt unter **${newCategory}**.`,
      components: []
    });
  }
}

// ------------------------------------------------------------
// DROPBOX VERSCHIEBEN
// ------------------------------------------------------------
async function moveDropboxFile(meta, newCategory) {
  const dbx = await getDropboxClient();

  const targetFolder = `${meta.base}/${meta.year}/${newCategory}/${meta.month}`;
  await createDropboxFolderIfMissing(targetFolder);

  const targetPath = `${targetFolder}/${meta.filename}`;

  await dbx.filesMoveV2({
    from_path: meta.fullPath,
    to_path: targetPath,
    autorename: true
  });
}

module.exports = {
  askForCorrection,
  handleCorrectionInteraction
};