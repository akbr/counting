import type { CounterTypes } from "./engine";
import { createStore, Store } from "./lib/server/store";
import { createSocketManager } from "./lib/socket/socketManager";

import { createServer } from "./lib/server/";
import { engine } from "./engine";

export type CounterStore = Store<CounterTypes>;

export function init() {
  let server = createServer(engine);
  //let server = "ws://localhost:5000";
  let manager = createSocketManager(server);
  let { store, meter } = createStore<CounterTypes>(manager);
  return { server, manager, store, meter };
}
