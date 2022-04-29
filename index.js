var express = require("express");
var cors = require("cors");
const sum_route = require("./routes/sum-route.js");
const path = require("path");

var app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.resolve(__dirname, "./public")));
app.use("/api/v1", sum_route);
app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});

app.listen(port, () => console.log("server running on port", port));
