// src/recall/context-recall-engine.js

const { getNotion } = require("../notion/client");

let lastRecallByUser = new Map();
const RECALL_COOLDOWN_MS = 30 * 60 * 1000; // 30 Minuten

async function recallActiveContexts({ userId, databaseId }) {
    const now = Date.now();

    if (lastRecallByUser.has(userId)) {
        const last = lastRecallByUser.get(userId);
        if (now - last < RECALL_COOLDOWN_MS) return null;
    }

    const notion = getNotion();

    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                { property: "Aktivierter Kontext", checkbox: { equals: true } },
                { property: "Supervisor-Flag", checkbox: { equals: true } }
            ]
        },
        sorts: [
            { property: "Kontext Timestamp", direction: "descending" }
        ],
        page_size: 1
    });

    if (!response.results.length) return null;

    lastRecallByUser.set(userId, now);

    const page = response.results[0];
    const title = page.properties.Titel.title[0]?.plain_text || "Aktiver Kontext";
    const snapshot = page.properties.Snapshot.rich_text[0]?.plain_text || "";

    return { title, snapshot };
}

module.exports = { recallActiveContexts };