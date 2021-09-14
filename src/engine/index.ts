import { Engine } from "./lib/server/types";

export type CounterTypes = {
  states: { type: "count"; data: number };
  actions: { type: "inc" } | { type: "dec" };
  msgs: { type: "error"; data: string };
  options: void;
};

export const engine: Engine<CounterTypes> = {
  getInitialState: () => ({ type: "count", data: 0 }),
  reducer(state, input) {
    if (!input) return state;

    let { action } = input;
    let { data } = state;

    if (action.type === "inc") {
      return {
        ...state,
        data: data + 1,
      };
    }

    if (action.type === "dec") {
      return {
        ...state,
        data: data - 1,
      };
    }

    return {
      type: "error",
      data: "The only valid actions types are inc and dec.",
    };
  },
  isState: (x) => x.type !== "error",
  autoStart: () => true,
};
