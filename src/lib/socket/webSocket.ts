import type { Socket } from "./types";

export function createWebSocket<I, O>(url: string) {
  let websocket = new WebSocket(url);

  let socket: Socket<I, O> = {
    send: (action) => {
      websocket.send(JSON.stringify(action));
    },
    close: () => websocket.close()
  };

  websocket.onopen = () => {
    if (socket.onopen) socket.onopen();
  };
  websocket.onclose = () => {
    if (socket.onclose) socket.onclose();
  };
  websocket.onmessage = (x) => {
    if (socket.onmessage) {
      let hydratedData = JSON.parse(x.data) as O;
      socket.onmessage(hydratedData);
    }
  };

  return socket;
}
