import type { Socket, Server } from "../socket/types";

function async(fn: () => unknown) {
  Promise.resolve().then(fn);
}

export function createLocalSocket<I, O>(server: Server<I, O>) {
  let clientSocket: Socket<I, O>;
  let serverSocket: Socket<O, I>;
  let connected = false;

  clientSocket = {
    send: (action) => {
      if (!connected) throw new Error("Local socket not connected.");
      server.onInput(serverSocket, action);
    },
    close: () => server.onClose(serverSocket)
  };

  serverSocket = {
    send: (state) => {
      if (clientSocket.onmessage) clientSocket.onmessage(state);
    },
    close: () => {
      server.onClose(serverSocket);
      if (clientSocket.onclose) clientSocket.onclose();
    }
  };

  async(() => {
    connected = true;
    if (clientSocket.onopen) clientSocket.onopen();
  });

  return clientSocket;
}
