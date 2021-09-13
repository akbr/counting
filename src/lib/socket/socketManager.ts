import type { Socket, Server } from "./types";
import { createWebSocket } from "./webSocket";
import { createLocalSocket } from "./localSocket";

export interface SocketManager<I, O> {
  openSocket: () => void;
  closeSocket: () => void;
  send: (action: I) => void;
  getStatus: () => boolean | undefined;
  onData: (result: O) => void;
  onStatus: (status: boolean) => void;
}

export function createSocketManager<I, O>(arg: Server<I, O> | string) {
  let currentSocket: Socket<I, O> | false = false;
  let currentSocketStatus: boolean;
  let sendBuffer: I[];
  let manager: SocketManager<I, O>;

  function openSocket() {
    if (currentSocket) manager.closeSocket();

    sendBuffer = [];
    currentSocket =
      typeof arg === "string"
        ? createWebSocket<I, O>(arg)
        : createLocalSocket(arg);

    currentSocket.onopen = () => {
      currentSocketStatus = true;
      sendBuffer.forEach((action) => manager.send(action));
      manager.onStatus(true);
    };

    currentSocket.onclose = () => manager.onStatus(false);
    currentSocket.onmessage = (state) => manager.onData(state);
  }

  function closeSocket() {
    if (!currentSocket) return;
    currentSocket.close();
    currentSocket.onmessage = undefined;
    currentSocket = false;
    currentSocketStatus = false;
  }

  function send(action: I) {
    if (!currentSocket) throw new Error("Socket manager has no open socket");
    if (!currentSocketStatus) {
      sendBuffer.push(action);
    } else {
      currentSocket.send(action);
    }
  }

  function getStatus() {
    return currentSocket ? currentSocketStatus : undefined;
  }

  manager = {
    openSocket,
    closeSocket,
    send,
    getStatus,
    onData: () => undefined,
    onStatus: () => undefined
  };

  return manager;
}
