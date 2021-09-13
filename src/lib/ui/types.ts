export type Controls = {
  finish: () => void;
  finished: Promise<unknown>;
};

export type Status = Controls | Controls[] | void;

export type Updater<T> = ($el: HTMLElement, props: T) => Status;

export type StatusLogger = (status: Status) => void;

export type Scene<T> = (props: T) => Status;
