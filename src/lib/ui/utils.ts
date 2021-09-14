import type { Status, Updater, Scene, WaitFn } from "./types";

import {
  h,
  render,
  FunctionComponent,
  ComponentChildren,
  Fragment,
  Ref,
} from "preact";
import { useRef, useLayoutEffect } from "preact/hooks";

type ViewOptions = {
  wait?: WaitFn;
  init?: ($el: HTMLElement) => void;
};

export function createScene<Props>(
  $root: HTMLElement,
  update: Updater<Props>,
  { wait, init }: ViewOptions = {}
): Scene<Props> {
  if (init) {
    init($root);
  }
  return function scene(props: Props) {
    let status = update($root, props);
    if (wait) wait(status);
    return status;
  };
}

let preactPendingStatuses: Status[] = [];
export function createPreactScene<Props>(
  $rootEl: HTMLElement,
  PreactComponent: FunctionComponent<Props>,
  { wait }: ViewOptions = {}
): Scene<Props> {
  return function update(props: Props): Status {
    preactPendingStatuses = [];
    render(h(PreactComponent, props), $rootEl);
    let status = preactPendingStatuses.flat() as Status;
    if (wait) wait(status);
    return status;
  };
}

export const Update = <T>({
  props,
  fn,
  children,
}: {
  props: T;
  fn: Updater<T>;
  children?: ComponentChildren;
}) => {
  //@ts-ignore
  let elRef: Ref<HTMLElement> = useRef();
  let firstChild = Array.isArray(children) ? children[0] : children;

  //@ts-ignore
  if (!firstChild.ref) {
    //@ts-ignore
    firstChild.ref = elRef;
  }

  useLayoutEffect(() => {
    // This is a hack around having to use forwardRef
    //@ts-ignore
    let $el = elRef.current.base ? elRef.current.base : elRef.current;
    let task = fn($el, props);
    if (task) preactPendingStatuses.push(task);
  }, [elRef, fn, props]);

  return h(Fragment, null, children);
};
