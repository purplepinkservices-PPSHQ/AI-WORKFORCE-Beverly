// src/reports/supervisor-report-engine.js

const { getNotion } = require("../notion/client");

async function buildSupervisorReport({ databaseId, mode = "daily" }) {
    const notion = getNotion();

    const since = new Date();
    if (mode === "weekly") {
        since.setDate(since.getDate() - 7);
    } else {
        since.setDate(since.getDate() - 1);
    }

    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                { property: "Supervisor-Flag", checkbox: { equals: true } },
                { property: "Aktivierter Kontext", checkbox: { equals: true } },
                {
                    property: "Kontext Timestamp",
                    date: { on_or_after: since.toISOString() }
                }
            ]
        },
        sorts: [
            { property: "Priorität", direction: "descending" },
            { property: "Kontext Timestamp", direction: "descending" }
        ],
        page_size: 10
    });

    if (!response.results.length) {
        return "🟢 **Supervisor-Report**\n\nKeine aktiven kritischen Kontexte.";
    }

    let report = `🧠 **Supervisor-Report (${mode === "weekly" ? "Woche" : "Heute"})**\n\n`;

    response.results.forEach((page, idx) => {
        const title = page.properties.Titel.title[0]?.plain_text || "Ohne Titel";
        const prio = page.properties.Priorität.select?.name || "–";
        const snapshot = page.properties.Snapshot.rich_text[0]?.plain_text || "";

        report += `**${idx + 1}. ${title}**\n`;
        report += `Priorität: **${prio}**\n`;
        if (snapshot) report += `${snapshot}\n`;
        report += "\n";
    });

    return report.trim();
}

module.exports = { buildSupervisorReport };
