import { h } from "preact";
import { setup } from "goober";

import { initFlow } from "./lib/initFlow";
import { engine, CounterTypes } from "./engine";
import { initScenes } from "./scenes";

setup(h);

const connect = engine;
// const connect = "ws://localhost:5000";
const { server, manager, store, meter, kit } = initFlow<CounterTypes>(connect);

initScenes(store, kit);

// ---

meter.push({ type: "title" });
manager.openSocket();
