import type { App } from "../types";

import { styled, css } from "goober";
import { Update } from "../lib/ui/utils";
import { Updater } from "../lib/ui/types";
import { fade } from "../updaters";

type ActionFn = () => void;

export function TitleView({
  state,
  transition,
  start,
}: Pick<App["store"], "state" | "transition"> & { start: ActionFn }) {
  if (state.type !== "title") return null;

  return (
    <Update fn={fade} props={transition}>
      <div style={{ textAlign: "center" }}>
        <h1>Counting Game</h1>
        <button onClick={start}>Start!</button>
      </div>
    </Update>
  );
}

export function CounterView({
  state,
  inc,
  dec,
}: Pick<App["store"], "state"> & { inc: ActionFn; dec: ActionFn }) {
  if (state.type !== "count") return null;

  return (
    <div>
      <div>Count: {state.data}</div>
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
  state,
}: Pick<App["store"], "room" | "state">) {
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

const waitingClass = css(`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0.5em;
`);

export const WaitingViews: [
  ($el: HTMLElement) => void,
  Updater<Pick<App["store"], "waiting">>
] = [
  ($el) => {
    $el.innerHTML = "⌛";
    $el.className = waitingClass;
  },
  ($el, { waiting }) => {
    $el.style.opacity = waiting ? String(1) : String(0);
  },
];
