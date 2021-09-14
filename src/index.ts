import { h } from "preact";
import { setup } from "goober";

import { initFlow } from "./lib/initFlow";

import { engine, CounterTypes } from "./engine";
import { initScenes } from "./scenes";

setup(h);

const { server, manager, store, meter, kit } = initFlow<CounterTypes>(engine);

initScenes(store, kit);

// ---

meter.push({ type: "title" });
manager.openSocket();
