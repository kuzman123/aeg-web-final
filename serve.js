// aeg-web-final — local read-only static preview server.
// Built-in Node.js modules only. GET/HEAD only. Serves a root directory
// (default: this folder) over loopback. Usage:
//   node serve.js [--root <dir>] [--port <n>]

"use strict";

var http = require("http");
var fs = require("fs");
var path = require("path");
var url = require("url");

function arg(name, def) {
  var i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

var ROOT = path.resolve(arg("--root", __dirname));
var PORT = Number(arg("--port", process.env.PORT || 8140));
var HOST = "127.0.0.1";

var MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

http.createServer(function (req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Allow": "GET, HEAD" });
    res.end("Method Not Allowed");
    return;
  }
  var pathname = decodeURIComponent(url.parse(req.url).pathname);
  if (pathname === "/") pathname = "/index.html";
  var target = path.resolve(ROOT, "." + pathname);
  if (target !== ROOT && target.indexOf(ROOT + path.sep) !== 0) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.stat(target, function (e, st) {
    if (e || !st.isFile()) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    var type = MIME[path.extname(target).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    if (req.method === "HEAD") { res.end(); return; }
    fs.createReadStream(target).pipe(res);
  });
}).listen(PORT, HOST, function () {
  console.log("aeg-web-final: serving " + ROOT + " at http://" + HOST + ":" + PORT + "/");
});
