import { init } from "./store";
import { TitleView, CounterView, RoomView } from "./views";
import { createPreactScene } from "./lib/ui/utils";
import shallow from "zustand/shallow";

type Init = ReturnType<typeof init>;

export function subscribeTitle({ store, meter, manager }: Init) {
  const { wait } = meter;
  const { send } = manager;

  let titleScene = createPreactScene(
    document.getElementById("title")!,
    TitleView,
    { wait }
  );

  const start = () => send(["server", { type: "join", data: { id: "test" } }]);

  return store.subscribe(
    ({ state, transition }) => {
      titleScene({ state, transition, start });
    },
    ({ state, transition }) => ({ state, transition }),
    shallow
  );
}

export function subscribeCounter({ store, meter, manager }: Init) {
  const { wait } = meter;
  const { send } = manager;

  let countScene = createPreactScene(
    document.getElementById("app")!,
    CounterView,
    { wait }
  );

  const inc = () => send(["engine", { type: "inc" }]);
  const dec = () => send(["engine", { type: "dec" }]);

  return store.subscribe(
    ({ state }) => {
      countScene({ state, inc, dec });
    },
    ({ state }) => ({ state }),
    shallow
  );
}

export function subscribeRoom({ store, meter, manager }: Init) {
  const { wait } = meter;

  let roomScene = createPreactScene(
    document.getElementById("room")!,
    RoomView,
    {
      wait
    }
  );

  return store.subscribe(
    roomScene,
    ({ room, state }) => ({ room, state }),
    shallow
  );
}
