"use strict";

const { matches } = require("./match");
const { analyze } = require("./analyze");
const { feedback } = require("./feedback");

module.exports = {
  id: "legal-lawyer",
  matches,
  analyze,
  feedback
};