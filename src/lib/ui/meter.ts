import type { Controls, Status, Transition } from "./types";

export function createMeter<T>() {
  let queue: T[] = [];
  let locked = false;
  let pending: Controls[] = [];
  let activeCycle = false;
  let emit: (state: T) => void;
  let changeListener: (state: boolean) => void;

  function next() {
    if (locked) return;
    if (pending.length) return;
    if (queue.length) {
      locked = true;
      let state = queue.shift()!;
      if (emit) emit(state);
    }
    if (activeCycle) {
      activeCycle = false;
      changeListener && changeListener(false);
    }
  }

  next();

  return {
    push: (state: T) => {
      queue.push(state);
      next();
    },
    proceed: () => {
      locked = false;
      if (pending.length) {
        activeCycle = true;
        changeListener && changeListener(true);
      }
      next();
    },
    wait: (t: Status) => {
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
    onRelease: (listener: (state: T) => void) => {
      emit = listener;
    },
    skip: () => {
      pending.forEach((c) => c.finish());
    },
    log: () => pending,
    onChange: (listener: (state: boolean) => void) => {
      changeListener = listener;
    },
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
    push,
  };
}
