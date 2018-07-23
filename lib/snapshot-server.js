const express = require("express");
const bodyParser = require("body-parser");

const app = express();
var server;
var onSnapshotReceivedCallback;
var onBaseSnapshotReceivedCallback;

var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
};

app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb", extended: true }));

app.post("/snapshots", (req, res) => {
  console.log("Snapshot received!");
  if (typeof onSnapshotReceivedCallback === "function") {
    onSnapshotReceivedCallback(req.body);
  }
  return res.status(200).send("Okay");
});

app.post("/baseSnapshots", (req, res) => {
  console.log("BaseSnapshot received!");
  if (typeof onBaseSnapshotReceivedCallback === "function") {
    onBaseSnapshotReceivedCallback(req.body);
  }
  return res.status(200).send("Okay");
});

function startSnapshotServer() {
  server = app.listen(6767, () => {
    console.log("Snapshot Server listening @ 6767");
  });
}

function stopSnapshotServer() {
  console.log("server disconnected");
  server.close();
}

function onSnapshotReceived(callback) {
  console.log("onSnapshotReceivedCallback registered...");
  onSnapshotReceivedCallback = callback;
}
function onBaseSnapshotReceived(callback) {
  console.log("onBaseSnapshotReceivedCallback registered...");
  onBaseSnapshotReceivedCallback = callback;
}

module.exports = {
  startSnapshotServer,
  stopSnapshotServer,
  onSnapshotReceived,
  onBaseSnapshotReceived
};
