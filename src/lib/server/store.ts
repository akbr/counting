import { SocketManager } from "../socket/socketManager";
import { default as createZStore } from "zustand/vanilla";

import { createTransitionMeter, Transition } from "../ui/meter";

import type {
  EngineTypesShape,
  ServerTypes,
  OutputsWith,
  InputsWith
} from "./types";

type ManagerWith<ET extends EngineTypesShape> = SocketManager<
  InputsWith<ET>,
  OutputsWith<ET>
>;

export type Store<ET extends EngineTypesShape> = {
  state: {type: "init"} | { type: "title" } | ET["states"];
  transition: Transition;
  room: ServerTypes<ET>["states"]["data"];
  send: ManagerWith<ET>["send"];
};

export function createStore<ET extends EngineTypesShape>(
  manager: ManagerWith<ET>
) {
  const store = createZStore<Store<ET>>(() => ({
    state: {type: "init"},
    transition: undefined as Transition,
    room: false,
    send: manager.send
  }));

  let meter = createTransitionMeter<Store<ET>["state"]>();

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

  return {
    store,
    meter
  };
}
