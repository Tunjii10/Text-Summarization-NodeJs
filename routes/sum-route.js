var express = require("express");
var summ = require("../controller/text-summarizer.js");
const router = express.Router();

router.post("/summarize", summ); // POST route to summarize text

module.exports = router;
