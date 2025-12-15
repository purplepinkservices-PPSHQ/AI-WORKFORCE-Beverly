/**
 * ============================================================
 * Beverly AI Workforce – Discord Bot (Railway Production)
 * Phase A + B – Stable
 * ============================================================
 */

require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

// ------------------------------------------------------------
// ENV CHECK (KRITISCH)
// ------------------------------------------------------------
if (!process.env.DISCORD_BOT_TOKEN && !process.env.BOT_TOKEN) {
    console.error("[FATAL] DISCORD_BOT_TOKEN fehlt!");
    process.exit(1);
}

// ------------------------------------------------------------
// EXPRESS SERVER (KEEP ALIVE FOR RAILWAY)
// ------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.status(200).send("Beverly AI Workforce is alive 🚀");
});

app.listen(PORT, () => {
    console.log(`[HTTP] Express Server läuft auf Port ${PORT}`);
});

// ------------------------------------------------------------
// SYSTEM
// ------------------------------------------------------------
const router = require("../system/router");
const state = require("../core/state");

// ------------------------------------------------------------
// NOTION
// ------------------------------------------------------------
const { testRead } = require("../notion/read-task-engine");
const { writeProjectMemory } = require("../notion/write-project-memory");

const TASK_ENGINE_DB_ID = process.env.TASK_ENGINE_DB_ID;
const PROJECT_MEMORY_DB_ID = process.env.PROJECT_MEMORY_DB_ID;

// ------------------------------------------------------------
// CREATOR MODULES
// ------------------------------------------------------------
const Verification = require("../creator/verification");
const VerificationAI = require("../creator/verification-ai");
const VerificationBrain = require("../creator/verification-brain");

const { showCreatorMainMenu, handleCreatorMenuMessage } = require("../creator/menu");
const { handleCreatorGeniusMessage } = require("../creator/genius");
const { handleCreatorContentUpload } = require("../creator/content-upload");

// ------------------------------------------------------------
// DISCORD CLIENT
// ------------------------------------------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User
    ]
});

// ------------------------------------------------------------
// READY
// ------------------------------------------------------------
client.once("ready", async () => {
    console.log(`🤖 Beverly Assistant Bot gestartet als: ${client.user.tag}`);

    // --- Notion Test ---
    try {
        console.log("🔍 Starte Notion Read-Test (Task Engine) …");
        await testRead(TASK_ENGINE_DB_ID);
        console.log("✅ Notion Read-Test erfolgreich.");
    } catch (err) {
        console.error("❌ Notion Read-Test fehlgeschlagen:", err.message);
    }

    // --- Memory Snapshot ---
    try {
        console.log("🧠 Schreibe Memory Snapshot …");
        await writeProjectMemory({
            databaseId: PROJECT_MEMORY_DB_ID,
            titel: "Railway Start – Beverly online",
            beschreibung: "Beverly läuft produktiv auf Railway.",
            memoryTags: ["Memory Engine", "Backend / System"],
            prioritaet: "Mittel",
            lastContext: "Railway Boot",
            kontextSignal: "Start",
            kontextMatching: 95,
            aktivierterKontext: true,
            letzteAktion: "Gespeichert",
            supervisorFlag: false,
            snapshot: "Startup erfolgreich",
            systemHinweis: "Railway Production",
            kontext: "Automatischer Start"
        });
        console.log("✅ Memory Snapshot erfolgreich geschrieben.");
    } catch (err) {
        console.error("❌ Memory Write fehlgeschlagen:", err.message);
    }
});

// ------------------------------------------------------------
// MESSAGE ROUTING (DM)
// ------------------------------------------------------------
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (!message.guild) {
        console.log("📩 DM:", message.author.username, "→", message.content);

        const handled = await router.routeDM(message, {
            Verification,
            VerificationAI,
            VerificationBrain,
            showCreatorMainMenu,
            handleCreatorMenuMessage,
            handleCreatorGeniusMessage,
            handleCreatorContentUpload,
            state
        });

        return handled;
    }
});

// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------
const TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN;

client.login(TOKEN)
    .then(() => console.log("🚀 Beverly ist online und wartet auf DMs."))
    .catch(err => {
        console.error("[FATAL] Discord Login Fehler:", err.message);
        process.exit(1);
    });

// ------------------------------------------------------------
// KEEP PROCESS ALIVE (RAILWAY SAFETY NET)
// ------------------------------------------------------------
setInterval(() => {
    // bewusst leer – hält Event Loop offen
}, 60 * 1000);
