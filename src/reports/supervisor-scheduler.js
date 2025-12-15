// src/reports/supervisor-scheduler.js

const { buildSupervisorReport } = require("./supervisor-report-engine");

let lastRunDate = null;

async function runDailySupervisorCheck(client) {
    const now = new Date();
    const hour = now.getHours();

    // Nur einmal pro Tag
    const today = now.toISOString().slice(0, 10);
    if (lastRunDate === today) return;

    // Zeitfenster: 08:55 – 09:05
    if (hour !== 9) return;

    lastRunDate = today;

    try {
        const report = await buildSupervisorReport({
            databaseId: process.env.PROJECT_MEMORY_DB_ID,
            mode: "daily"
        });

        // Wenn kein relevanter Inhalt → nichts senden
        if (report.includes("Keine aktiven kritischen Kontexte")) {
            console.log("🟢 Supervisor: nichts zu melden.");
            return;
        }

        const ownerId = process.env.OWNER_DISCORD_ID;
        const user = await client.users.fetch(ownerId);

        await user.send(report);
        console.log("📩 Supervisor-Report gesendet.");

    } catch (err) {
        console.error("❌ Supervisor-Scheduler Fehler:", err.message);
    }
}

function startSupervisorScheduler(client) {
    setInterval(() => {
        runDailySupervisorCheck(client);
    }, 60 * 1000); // jede Minute prüfen
}

module.exports = { startSupervisorScheduler };
