export type EngineTypesShape = {
  states: any;
  msgs: any;
  actions: any;
  options: any;
};

export interface Engine<T extends EngineTypesShape> {
  shouldAddSeat?: (numSeats: number, gameStarted: boolean) => boolean;
  shouldRemoveSeat?: (numSeats: number, gameStarted: boolean) => boolean;
  shouldStart?: (numSeats: number) => boolean;
  autoStart?: () => boolean;
  getInitialState: (numSeats: number, options?: T["options"]) => T["states"];
  reducer: (
    state: T["states"],
    input?: { action: T["actions"]; seatIndex: number }
  ) => T["states"] | T["msgs"];
  isState?: (x: T["states"] | T["msgs"]) => boolean;
  adapt?: (state: T["states"], seatIndex: number) => T["states"];
}

// ---

export type Room = {
  type: "room";
  data:
    | {
        id: string;
        seats: string[];
        spectators: number;
        seatIndex: number;
      }
    | false;
};

export type Error = {
  type: "error";
  data: string;
};

export type Join = {
  type: "join";
  data: { id: string; seatIndex?: number };
};
export type Start<Options> = {
  type: "start";
  data: Options;
};

export type ServerTypes<ET extends EngineTypesShape> = {
  states: Room;
  msgs: Error;
  actions: Join | Start<ET["options"]>;
};

export type OutputsWith<ET extends EngineTypesShape> =
  | ["engine", ET["states"]]
  | ["engineMsg", ET["msgs"]]
  | ["server", ServerTypes<ET>["states"]]
  | ["serverMsg", ServerTypes<ET>["msgs"]];

export type InputsWith<ET extends EngineTypesShape> =
  | ["engine", ET["actions"]]
  | ["server", ServerTypes<ET>["actions"]];
