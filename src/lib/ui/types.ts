export type Controls = {
  finish: () => void;
  finished: Promise<unknown>;
};

export type Status = Controls | Controls[] | void;

export type Updater<T> = ($el: HTMLElement, props: T) => Status;

export type WaitFn = (status: Status) => void;

export type Scene<T> = (props: T) => Status;

export type Transition = "in" | "out" | undefined;
