(function(window) {
  "use strict";

  var prevSuite = {
    children: {},
    snapshots: {}
  };

  window.__snapshot__ = {
    update: false,
    suite: prevSuite
  };

  window.__snapshot__.addSuite = function(name, suite) {
    prevSuite.children[name] = suite;
  };

  var normalizeNewlines = function(s) {
    return s.replace(/\r\n|\r/g, "\n");
  };

  var setSnapshot = function(path, index, code, lang, dirty) {
    const dataToSend = {
      path: path,
      index: index,
      code: code,
      lang: lang,
      dirty: dirty
    };
    post("/snapshots", dataToSend);
  };

  window.__snapshot__.get = function(path, index) {
    var key, s, i, testName, snapshotList, snapshot;
    var suite = prevSuite;

    for (i = 0; i < path.length - 1; i++) {
      key = path[i];
      s = suite.children[key];
      if (s === undefined) {
        return undefined;
      } else {
        suite = s;
      }
    }

    testName = path[path.length - 1];
    snapshotList = suite.snapshots[testName];
    if (snapshotList !== undefined) {
      snapshot = snapshotList[index];
      if (snapshot !== undefined) {
        setSnapshot(path, index, snapshot.code, snapshot.lang, false);
      }
      return snapshot;
    }

    return undefined;
  };

  window.__snapshot__.set = setSnapshot;

  window.__snapshot__.match = function(received, expected) {
    return received === normalizeNewlines(expected);
  };

  function post(api, data) {
    const url = "http://localhost:6767" + api;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.send(JSON.stringify(data));
  }
})(window);
