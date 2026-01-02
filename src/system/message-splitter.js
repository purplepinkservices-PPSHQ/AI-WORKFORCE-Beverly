"use strict";

/**
 * Discord Message Splitter
 * - Max 2000 chars pro Message
 * - Bewahrt Absätze & Reihenfolge
 */
function splitForDiscord(text = "", max = 1900) {
  const chunks = [];
  let buffer = "";

  const lines = String(text).split("\n");

  for (const line of lines) {
    if ((buffer + line + "\n").length > max) {
      if (buffer.trim()) chunks.push(buffer);
      buffer = line + "\n";
    } else {
      buffer += line + "\n";
    }
  }

  if (buffer.trim()) chunks.push(buffer);
  return chunks;
}

module.exports = { splitForDiscord };