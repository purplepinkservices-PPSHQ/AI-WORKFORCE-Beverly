require("dotenv").config();
const { REST, Routes } = require("discord.js");

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log("🧹 Lösche ALLE globalen Slash-Commands …");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );

    console.log("✅ Alle globalen Commands gelöscht.");
  } catch (error) {
    console.error("❌ Fehler beim Löschen:", error);
  }
})();
