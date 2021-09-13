import { Server } from "ws";
import { Socket, Server as SocketServer } from "../socket/types";

function noop() {}
function addHeartbeat(wss: Server, ms = 25000) {
  function heartbeat() {
    //@ts-ignore
    this.isAlive = true;
  }

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      //@ts-ignore
      if (ws.isAlive === false) return ws.terminate();
      //@ts-ignore
      ws.isAlive = false;
      ws.ping(noop);
    });
  }, ms);

  wss.on("connection", function (ws) {
    //@ts-ignore
    ws.isAlive = true;
    //@ts-ignore
    ws.on("pong", heartbeat);
  });

  wss.on("close", function close() {
    clearInterval(interval);
  });
}

export const mount =
  (expressServer: Express.Application) =>
  (socketServer: SocketServer<any, any>) => {
    const wss = new Server({ server: expressServer as any });
    addHeartbeat(wss);

    wss.on("connection", function (ws) {
      const socket: Socket<any,any> = {
        send: (msg) => ws.send(JSON.stringify(msg)),
        close: ws.close
      };

      socketServer.onOpen(socket);

      ws.on("message", function (msg: any) {
        if (typeof msg === "string") {
          socketServer.onInput(socket, JSON.parse(msg));
        }
      });

      ws.on("close", function () {
        socketServer.onClose(socket);
      });
    });
  };