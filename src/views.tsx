import { styled } from "goober";
import { style } from "./lib/ui/stylus";
import { Update } from "./lib/ui/utils";
import { Updater } from "./lib/ui/types";
import type { CounterStore } from "./store";

type ActionFn = () => void;

const fadeIn: Updater<CounterStore["transition"]> = ($el, props) => {
  if (props === "in") {
    style($el, { opacity: 0, y: -20 });
    return style($el, { opacity: 1, y: 0 }, { duration: 300, easing: "ease" });
  } else if (!props) {
    style($el, { opacity: 1 });
  } else if (props === "out") {
    style($el, { opacity: 1 });
    return style($el, { opacity: 0 }, { duration: 300, easing: "ease" });
  }
};

export function TitleView({
  state,
  transition,
  start
}: Pick<CounterStore, "state" | "transition"> & { start: ActionFn }) {
  if (state.type !== "title") return null;

  return (
    <Update fn={fadeIn} props={transition}>
      <div style={{ textAlign: "center" }}>
        <h1>Counting game!</h1>
        <button onClick={start}>Start</button>
      </div>
    </Update>
  );
}

export function CounterView({
  state,
  inc,
  dec
}: Pick<CounterStore, "state"> & { inc: ActionFn; dec: ActionFn }) {
  if (state.type !== "count") return null;

  return (
    <div>
      <div>Count: {state.data} !</div>
      <button onClick={inc}>+</button>
      <button onClick={dec}>-</button>
    </div>
  );
}

const RoomContainer = styled("div")`
  position: absolute;
  padding: 0.3em;
  top: 0;
  right: 0;
  background-color: #999;
`;

export function RoomView({
  room,
  state
}: Pick<CounterStore, "room" | "state">) {
  if (state.type === "title") return null;
  if (room === false) return null;

  let { id, seats, spectators, seatIndex } = room;

  return (
    <RoomContainer>
      Room: {id} | Seats: {JSON.stringify(seats)} | seatIndex: {seatIndex} |
      spectators: {spectators}
    </RoomContainer>
  );
}
