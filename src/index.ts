import { init } from "./store";
import * as subscriptions from "./subscriptions";

import { h } from "preact";
import { setup } from "goober";
setup(h);

let initStuff = init();
let { server, manager, store, meter } = initStuff;

Object.values(subscriptions).forEach((subscription) => subscription(initStuff));

//meter.push({ type: "title" });
manager.openSocket();

manager.send(["server", { type: "join", data: { id: "test" } }])
manager.send(["engine", { type: "inc" }])
manager.send(["engine", { type: "inc" }])
manager.send(["engine", { type: "inc" }])