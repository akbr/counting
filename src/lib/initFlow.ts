import { createSocketManager, SocketManager } from "./socket/socketManager";

import type {
  EngineTypesShape,
  OutputsWith,
  InputsWith,
  Engine,
  Room,
} from "./server/types";
import { createServer } from "./server";

import { WaitFn, Transition } from "./ui/types";
import { createTransitionMeter } from "./meter";

import { default as createZStore, StoreApi } from "zustand/vanilla";

type SocketManagerWith<ET extends EngineTypesShape> = SocketManager<
  InputsWith<ET>,
  OutputsWith<ET>
>;

export type AppStates<ET extends EngineTypesShape> =
  | { type: "init" }
  | { type: "title" }
  | ET["states"];

export type StoreState<ET extends EngineTypesShape> = {
  state: AppStates<ET>;
  transition: Transition;
  room: Room["data"];
  waiting: boolean;
};

export type AppTypes<ET extends EngineTypesShape> = {
  store: StoreState<ET>;
  storeApi: StoreApi<StoreState<ET>>;
  kit: {
    send: SocketManagerWith<ET>["send"];
    wait: WaitFn;
  };
};

export function createStore<ET extends EngineTypesShape>(
  manager: SocketManagerWith<ET>
) {
  const meter = createTransitionMeter<StoreState<ET>["state"]>();

  const store = createZStore<StoreState<ET>>(() => ({
    state: { type: "init" },
    transition: undefined as Transition,
    room: false,
    waiting: false,
  }));

  manager.onData = (res) => {
    if (res[0] === "engine") {
      meter.push(res[1]);
    }

    if (res[0] === "engineMsg") {
      console.warn(res[1]);
    }

    if (res[0] === "server") {
      store.setState({ room: res[1].data });
    }

    if (res[0] === "serverMsg") {
      console.warn(res[1]);
    }
  };

  meter.onRelease(([state, transition]) => {
    store.setState({ state, transition });
    Promise.resolve().then(meter.proceed);
  });

  meter.onChange((waiting) => {
    store.setState({ waiting });
  });

  return {
    store,
    meter,
  };
}

export function initFlow<ET extends EngineTypesShape>(
  engineOrURL: Engine<ET> | string
) {
  let server =
    typeof engineOrURL === "string" ? engineOrURL : createServer(engineOrURL);
  let manager = createSocketManager(server);
  let { store, meter } = createStore<ET>(manager);

  return {
    store,
    kit: {
      wait: meter.wait,
      send: manager.send,
    },
    server,
    manager,
    meter,
  };
}
