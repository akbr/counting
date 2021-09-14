import { SceneSetup, CounterStoreApi, CounterKit } from "./types";
import { TitleView, CounterView, RoomView, WaitingViews } from "./views";
import { createPreactScene, createScene } from "./lib/ui/utils";
import shallow from "zustand/shallow";

export const setups: SceneSetup[] = [
  function title(store, { wait, send }) {
    const titleScene = createPreactScene(
      document.getElementById("title")!,
      TitleView,
      { wait }
    );

    const actions = {
      start: () => send(["server", { type: "join", data: { id: "test" } }]),
    };

    return store.subscribe(
      ({ state, transition }) => {
        titleScene({ state, transition, ...actions });
      },
      ({ state, transition }) => ({ state, transition }),
      shallow
    );
  },
  function counter(store, { wait, send }) {
    const countScene = createPreactScene(
      document.getElementById("app")!,
      CounterView,
      { wait }
    );

    const actions = {
      inc: () => send(["engine", { type: "inc" }]),
      dec: () => send(["engine", { type: "dec" }]),
    };

    return store.subscribe(
      ({ state }) => {
        countScene({ state, ...actions });
      },
      ({ state }) => ({ state }),
      shallow
    );
  },
  function room(store, { wait }) {
    const roomScene = createPreactScene(
      document.getElementById("room")!,
      RoomView,
      {
        wait,
      }
    );

    return store.subscribe(
      roomScene,
      ({ room, state }) => ({ room, state }),
      shallow
    );
  },
  function waiting(store, { wait }) {
    const [init, view] = WaitingViews;

    const waitingScene = createScene(
      document.getElementById("waiting")!,
      view,
      {
        init,
        wait,
      }
    );

    return store.subscribe(
      waitingScene,
      ({ waiting }) => ({ waiting }),
      shallow
    );
  },
];

export const initScenes = (store: CounterStoreApi, kit: CounterKit) => {
  setups.forEach((setup) => setup(store, kit));
};
