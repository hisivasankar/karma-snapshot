const express = require("express");
const bodyParser = require("body-parser");

const app = express();
let logger = console;

var server;
var onSnapshotReceivedCallback;

var configureLogger = function(loggerInstance) {
  logger = loggerInstance;
};

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
  logger.debug("Snapshot received!");
  if (typeof onSnapshotReceivedCallback === "function") {
    onSnapshotReceivedCallback(req.body);
  }
  return res.status(200).send("Okay");
});

function start() {
  server = app.listen(6767, () => {
    logger.debug("Snapshot Server listening @ 6767");
  });
}

function stop() {
  logger.debug("server disconnected");
  server.close();
}

function onSnapshotReceived(callback) {
  logger.debug("onSnapshotReceivedCallback registered...");
  onSnapshotReceivedCallback = callback;
}

module.exports = {
  configureLogger,
  start,
  stop,
  onSnapshotReceived
};
