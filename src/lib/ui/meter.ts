import type { Controls, StatusLogger } from "./types";

export interface Meter<T> {
  push: (state: T) => void;
  proceed: () => void;
  wait: StatusLogger;
  onRelease: (listener: (state: T) => void) => void;
}

export function createMeter<T>(): Meter<T> {
  let queue: T[] = [];
  let locked = false;
  let pending: Controls[] = [];
  let emit: (state: T) => void;

  function next() {
    if (locked) return;
    if (pending.length) return;
    if (queue.length) {
      locked = true;
      let state = queue.shift()!;
      if (emit) emit(state);
    }
  }

  next();

  return {
    push: (x) => {
      queue.push(x);
      next();
    },
    proceed: () => {
      locked = false;
      next();
    },
    wait: (t) => {
      if (!t) return;
      t = Array.isArray(t) ? t : [t];
      t.forEach((control) => {
        pending.push(control);
        control.finished.then(() => {
          pending = pending.filter((x) => x !== control);
          next();
        });
      });
    },
    onRelease: (listener) => {
      emit = listener;
    }
  };
}

function pairwise<T, R>(fn: (state: T, prevState?: T) => R) {
  let curr: T;
  return (input: T) => {
    let prev = curr;
    curr = input;
    fn((curr = input), prev);
  };
}

export type Transition = "in" | "out" | undefined;
type TransitionTuple<T> = [T, Transition];
export function injectTransition<T>(push: (arg: TransitionTuple<T>) => void) {
  return pairwise<T, void>((curr, prev) => {
    if (prev !== undefined) push([prev, "out"]);
    push([curr, "in"]);
    push([curr, undefined]);
  });
}

export function createTransitionMeter<T>() {
  let meter = createMeter<TransitionTuple<T>>();
  let push = injectTransition(meter.push);
  return {
    ...meter,
    push
  };
}
