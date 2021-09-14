import express from "express";
import * as path from "path";

import { createServer } from "./lib/server/";
import { mount } from "./lib/server/expressHarness";
import { engine } from "./engine";

const PORT = process.env.PORT || 5000;
const distPath = path.resolve("dist/");

const expressServer = express()
  .use(express.static(distPath))
  .get("/", function (_, res) {
    res.sendFile("index.html", { root: distPath });
  })
  .listen(PORT, function () {
    return console.log("Listening on " + PORT);
  });

const socketServer = createServer(engine);

mount(expressServer, socketServer);
