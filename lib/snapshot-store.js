const snapshotServer = require("./snapshot-server");

var prevSuite = {
  children: {},
  snapshots: {}
};
var nextSuite = {
  visited: false,
  dirty: false,
  children: {},
  snapshots: {}
};

var normalizeNewlines = function(s) {
  return s.replace(/\r\n|\r/g, "\n");
};

var addSuite = function(name, suite) {
  prevSuite.children[name] = suite;
};

var setSnapshot = function(path, index, code, lang, dirty) {
  if (dirty === void 0) {
    dirty = true;
  }
  var suite = nextSuite;
  suite.visited = true;
  if (dirty) {
    suite.dirty = true;
  }
  for (var i = 0; i < path.length - 1; i++) {
    var key = path[i];
    var s = suite.children[key];
    if (s === undefined) {
      suite.children[key] = suite = {
        visited: true,
        dirty: dirty,
        children: {},
        snapshots: {}
      };
    } else {
      suite = s;
      suite.visited = true;
      if (dirty) {
        suite.dirty = true;
      }
    }
  }
  var testName = path[path.length - 1];
  var snapshotList = suite.snapshots[testName];
  if (snapshotList === undefined) {
    suite.snapshots[testName] = snapshotList = [];
  }
  snapshotList[index] = {
    visited: true,
    dirty: dirty,
    lang: lang,
    code: normalizeNewlines(code)
  };
};

var copyMissingSnapshots = function(prev, next) {
  var snapshotList, nextChild, key, i;

  var pChildren = prev.children;
  var pSnapshots = prev.snapshots;

  for (key in pChildren) {
    if (hasOwnProperty.call(pChildren, key)) {
      nextChild = next.children[key];
      if (nextChild === undefined) {
        next.children[key] = pChildren[key];
      } else {
        copyMissingSnapshots(pChildren[key], nextChild);
      }
    }
  }

  for (key in pSnapshots) {
    if (hasOwnProperty.call(pSnapshots, key)) {
      nextChild = next.snapshots[key];
      if (nextChild === undefined) {
        next.snapshots[key] = pSnapshots[key];
      } else {
        snapshotList = pSnapshots[key];
        for (i = nextChild.length; i < snapshotList.length; i++) {
          nextChild.push(snapshotList[i]);
        }
      }
    }
  }
};

snapshotServer.onBaseSnapshotReceived(function(data) {
  const { name, suite } = data;
  addSuite(name, suite);
});

snapshotServer.onSnapshotReceived(function(data) {
  const { path, index, code, lang, dirty } = data;
  setSnapshot(path, index, code, lang, dirty);
});

var getSnapshots = function() {
  copyMissingSnapshots(prevSuite, nextSuite);
  return nextSuite;
};

module.exports = {
  startServer: snapshotServer.startSnapshotServer,
  stopServer: snapshotServer.stopSnapshotServer,
  getSnapshots
};
