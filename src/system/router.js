// src/system/router.js

const { writeMemoryFromDiscord } = require("../memory/memory-from-discord");
const { writeDailySnapshot } = require("../memory/daily-snapshot");
const { recallActiveContexts } = require("../recall/context-recall-engine");
const { buildSupervisorReport } = require("../reports/supervisor-report-engine");

async function routeDM(message, modules) {
    const {
        Verification,
        VerificationAI,
        VerificationBrain,
        handleCreatorMenuMessage,
        handleCreatorGeniusMessage,
        handleCreatorContentUpload,
        state
    } = modules;

    const contentRaw = message.content || "";
    const content = contentRaw.trim().toLowerCase();
    const userId = message.author.id;
    const mode = state.getUserState(userId);

    // ------------------------------------------------------------
    // 🧠 PHASE E – KONTEXT-RECALL (SANFT)
    // ------------------------------------------------------------
    try {
        const recall = await recallActiveContexts({
            userId,
            databaseId: process.env.PROJECT_MEMORY_DB_ID
        });

        if (recall) {
            await message.reply(
                "🧠 **Aktiver Kontext vorhanden:**\n" +
                `**${recall.title}**\n\n` +
                `${recall.snapshot}\n\n` +
                "_Sag **weiter**, um daran anzuknüpfen._"
            );
        }
    } catch (err) {
        console.error("❌ Kontext-Recall Fehler:", err.message);
    }

    // ------------------------------------------------------------
    // 🟣 COMMANDS – REPORTS
    // ------------------------------------------------------------
    if (content === "report" || content === "tagesreport") {
        const report = await buildSupervisorReport({
            databaseId: process.env.PROJECT_MEMORY_DB_ID,
            mode: "daily"
        });
        await message.reply(report);
        return true;
    }

    if (content === "wochenreport") {
        const report = await buildSupervisorReport({
            databaseId: process.env.PROJECT_MEMORY_DB_ID,
            mode: "weekly"
        });
        await message.reply(report);
        return true;
    }

    // ------------------------------------------------------------
    // 🟣 COMMANDS – SNAPSHOTS
    // ------------------------------------------------------------
    if (content === "snapshot") {
        await writeDailySnapshot({
            databaseId: process.env.PROJECT_MEMORY_DB_ID,
            title: "Tages-Snapshot",
            description: "Manuell ausgelöster Snapshot.",
            signal: "Fortsetzen"
        });

        await message.reply("🧠 Snapshot gespeichert.");
        return true;
    }

    if (content === "abend") {
        await writeDailySnapshot({
            databaseId: process.env.PROJECT_MEMORY_DB_ID,
            title: "Abend-Snapshot",
            description: "Tagesabschluss.",
            signal: "Abschluss"
        });

        await message.reply("🌙 Abend-Snapshot gespeichert.");
        return true;
    }

    if (["menu", "menü", "creator"].includes(content)) {
        state.clearUserState(userId);
        await handleCreatorMenuMessage(message);
        return true;
    }

    // ------------------------------------------------------------
    // 🧠 AUTO MEMORY (A–D)
    // ------------------------------------------------------------
    writeMemoryFromDiscord({
        databaseId: process.env.PROJECT_MEMORY_DB_ID,
        message,
        source: "Discord DM"
    }).catch(err => {
        console.error("❌ Auto-Memory fehlgeschlagen:", err.message);
    });

    // ------------------------------------------------------------
    // FLOWS
    // ------------------------------------------------------------
    if (mode === "verification") {
        if (await Verification.handleVerificationMessage(message)) return true;
    }

    if (await VerificationAI.handleAIMessage?.(message)) return true;
    if (await VerificationBrain.handleBrainMessage?.(message)) return true;

    if (content.includes("genius")) {
        if (await handleCreatorGeniusMessage(message)) {
            state.setUserState(userId, "genius");
            return true;
        }
    }

    if (message.attachments.size > 0) {
        if (await handleCreatorContentUpload(message)) return true;
    }

    // ------------------------------------------------------------
    // DEFAULT
    // ------------------------------------------------------------
    await message.reply(
        "💙 Ich bin da.\n" +
        "Befehle:\n" +
        "• `report` / `tagesreport`\n" +
        "• `wochenreport`\n" +
        "• `snapshot`\n" +
        "• `abend`\n" +
        "• `menu`"
    );

    return true;
}

module.exports = { routeDM };


