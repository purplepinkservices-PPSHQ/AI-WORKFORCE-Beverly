// src/notion/client.js

const { Client } = require("@notionhq/client");

let notionInstance = null;

function getNotion() {
    if (notionInstance) return notionInstance;

    notionInstance = new Client({
        auth: process.env.NOTION_API_KEY,
    });

    return notionInstance;
}

module.exports = { getNotion };