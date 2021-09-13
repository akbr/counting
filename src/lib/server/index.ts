import type { Server, Socket } from "../socket/types";
import type { Engine, EngineTypesShape, InputsWith, OutputsWith } from "./types";

export function createServer<ET extends EngineTypesShape>(engine: Engine<ET>) {
  // Types
  // --------------
  type Api = Server<InputsWith<ET>, OutputsWith<ET>>;
  type ServerSocket = Socket<OutputsWith<ET>, InputsWith<ET>>;

  type Room = {
    id: string;
    seats: (ServerSocket | false)[];
    spectators: ServerSocket[];
    state: ET["states"] | false;
  };

  // State
  // --------------
  const rooms = new Map<string, Room>();
  const sockets = new Map<ServerSocket, string | false>();

  // Logic
  // --------------
  const {
    shouldAddSeat = () => true,
    shouldRemoveSeat = () => true,
    shouldStart = () => true,
    autoStart = () => false,
    getInitialState,
    reducer,
    isState,
    adapt = (x) => x
  } = engine;

  function createRoom(id: string) {
    rooms.set(id, {
      id,
      seats: [],
      spectators: [],
      state: autoStart() ? getInitialState(0) : false
    });
    return rooms.get(id) as Room;
  }

  function getRoom(socket: ServerSocket) {
    let id = sockets.get(socket);
    return id ? rooms.get(id) : false;
  }

  function broadcastRoomUpdate(room: Room) {
    let { id } = room;
    let seats = room.seats.map((_, idx) => String(idx));
    let spectators = room.spectators.length;

    [...room.seats, ...room.spectators].forEach((socket) => {
      if (!socket) return;
      socket.send([
        "server",
        {
          type: "room",
          data: {
            id,
            seats,
            spectators,
            seatIndex: room.seats.indexOf(socket)
          }
        }
      ]);
    });
  }

  function joinRoom(
    socket: ServerSocket,
    id: string,
    requestedPlayerIndex?: number
  ): string | void {
    let room = rooms.get(id) || createRoom(id);
    let numSeats = room.seats.length;

    const addSocket = () => {
      sockets.set(socket, room.id);
      broadcastRoomUpdate(room);
      if (room.state) {
        socket.send(["engine", adapt(room.state, room.seats.indexOf(socket))]);
      }
    };

    if (requestedPlayerIndex === undefined) {
      let openSeats = room.seats.indexOf(false) > -1;
      let roomForNewSeats = shouldAddSeat(numSeats, room.state !== false);

      if (!openSeats && !roomForNewSeats) {
        room.spectators.push(socket);
        return addSocket();
      }

      let firstOpenSeat = room.seats.indexOf(false);
      if (firstOpenSeat > -1) {
        room.seats[firstOpenSeat] = socket;
      } else {
        room.seats.push(socket);
      }
    } else {
      if (requestedPlayerIndex > numSeats) {
        return `Can't skip seats. Next seat is ${numSeats}`;
      }

      let seatOpen = room.seats[requestedPlayerIndex] === false;

      if (!seatOpen) {
        return `Seat ${requestedPlayerIndex} is occupied`;
      }
      room.seats[requestedPlayerIndex] = socket;
    }
    return addSocket();
  }

  function leaveRoom(socket: ServerSocket) {
    let room = getRoom(socket);
    if (!room) return;

    let seatIndex = room.seats.indexOf(socket);
    if (seatIndex !== -1) {
      room.seats[seatIndex] = false;
    }

    room.spectators = room.spectators.filter((x) => x !== socket);

    let roomIsEmpty = room.seats.filter((x) => x).length === 0;

    if (roomIsEmpty) {
      let socketsToEject = [socket, ...room.spectators];
      socketsToEject.forEach((socket) => {
        sockets.delete(socket);
        socket.send(["server", { type: "room", data: false }]);
      });
      rooms.delete(room.id);
    } else {
      if (shouldRemoveSeat(room.seats.length, room.state !== false)) {
        room.seats = room.seats.filter((x) => x);
      }

      broadcastRoomUpdate(room);
    }
  }

  function broadcastState(room: Room) {
    room.seats.forEach((socket, seatIndex) => {
      if (socket && room.state)
        socket.send(["engine", adapt(room.state, seatIndex)]);
    });
  }

  function updateRoomState(
    room: Room,
    socket?: ServerSocket,
    action?: ET["actions"]
  ) {
    if (!room.state) {
      if (socket) {
        socket.send([
          "serverMsg",
          { type: "error", data: "Game hasn't yet started." }
        ]);
      }
      return;
    }

    let res: ET["states"] | ET["msgs"];

    if (socket && action) {
      let seatIndex = room.seats.indexOf(socket);
      res = reducer(room.state, { action, seatIndex });
    } else {
      res = reducer(room.state);
    }

    if (res === room.state) return;

    if (isState) {
      if (isState(res)) {
        room.state = res as ET["states"];
      } else {
        if (socket) socket.send(["engineMsg", res as ET["msgs"]]);
        return;
      }
    }

    broadcastState(room);
    updateRoomState(room);
  }

  // API implemenation
  // -----------------
  const onInput: Api["onInput"] = (socket, envelope) => {
    // Server ET["actions"]
    if (envelope[0] === "server") {
      let action = envelope[1];
      if (action.type === "join") {
        leaveRoom(socket);
        let { id, seatIndex } = action.data;
        let err = joinRoom(socket, id, seatIndex);

        if (err) {
          socket.send(["serverMsg", { type: "error", data: err }]);
        }
        return;
      }
    }

    let room = getRoom(socket);
    if (!room) {
      socket.send([
        "serverMsg",
        { type: "error", data: "You are not in a room." }
      ]);
      return;
    }

    if (envelope[0] === "server") {
      let action = envelope[1];

      if (action.type === "start") {
        let isPlayer0 = room.seats.indexOf(socket) === 0;
        if (!isPlayer0) {
          socket.send([
            "serverMsg",
            { type: "error", data: "You aren't the room creator." }
          ]);
        }

        if (!shouldStart(room.seats.length)) {
          socket.send([
            "serverMsg",
            { type: "error", data: "Wrong number of players." }
          ]);
        }

        room.state = getInitialState(room.seats.length, action.data);

        broadcastState(room);
        updateRoomState(room);
        return;
      }

      socket.send([
        "serverMsg",
        { type: "error", data: "Invalid server command." }
      ]);
    }

    // Engine ET["actions"]
    if (envelope[0] === "engine") {
      updateRoomState(room, socket, envelope[1]);
    }
  };

  return {
    onOpen: (socket) => {
      socket.send(["server", { type: "room", data: false }]);
    },
    onClose: (socket) => {
      leaveRoom(socket);
    },
    onInput
  } as Api;
}
