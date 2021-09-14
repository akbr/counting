import type { Store, StoreApi, Kit } from "./lib/createStore";
import type { CounterTypes } from "./engine";

export type CounterStore = Store<CounterTypes>;
export type CounterStoreApi = StoreApi<CounterTypes>;
export type CounterKit = Kit<CounterTypes>;
export type SceneSetup = (
  store: CounterStoreApi,
  kit: CounterKit
) => void | (() => void);
