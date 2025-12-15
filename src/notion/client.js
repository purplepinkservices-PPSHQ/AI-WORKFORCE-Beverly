// src/notion/client.js

const { Client } = require("@notionhq/client");

let notionInstance = null;

function getNotion() {
    if (notionInstance) return notionInstance;

    if (!process.env.NOTION_API_KEY) {
        throw new Error("NOTION_API_KEY fehlt in den ENV-Variablen");
    }

    notionInstance = new Client({
        auth: process.env.NOTION_API_KEY,
    });

    return notionInstance;
}

module.exports = { getNotion };
