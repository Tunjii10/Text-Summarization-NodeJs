var express = require("express");
const path = require("path");

var app = express();
const port = 3000;

app.use(express.static(path.resolve(__dirname, "./public")));
app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//app.use("api/v1/summarize");

app.listen(port, () => console.log("server running on port", port));
