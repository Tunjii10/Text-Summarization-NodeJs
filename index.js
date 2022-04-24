var express = require("express");
var cors = require("cors");
var app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("api/v1/summarize");

app.listen(port, () => console.log("server running on port", port));
