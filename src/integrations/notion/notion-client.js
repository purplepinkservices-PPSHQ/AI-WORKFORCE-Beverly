"use strict";

const { Client } = require("@notionhq/client");

if (!process.env.NOTION_TOKEN) {
  throw new Error("NOTION_TOKEN fehlt in .env");
}

const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

module.exports = { notion };