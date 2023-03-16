import * as stream from 'stream';
import getPort, { portNumbers } from 'get-port';
import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

export type { Express, Request, Response, NextFunction };

export interface Server {
  port: number;
  host: string;
  close: () => Promise<void>;
}

export interface Sockets {
  [key: string]: (wss: WebSocketServer) => void;
}

interface SocketHandler {
  path: string;
  wss: WebSocket.Server<WebSocket.WebSocket>;
}

let port: number;
const doUpgrade =
  (handlers: SocketHandler[]) =>
  (
    request: http.IncomingMessage,
    socket: stream.Duplex,
    head: Buffer
  ): void => {
    const { pathname } = new URL(
      `${request.url?.toString()}`,
      `http://${request.headers.host}`
    );

    for (const { wss, path } of handlers) {
      if (pathname === path) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
        return;
      }
    }

    socket.destroy();
    return;
  };

type WebSetup = (app: Express) => void;
type StubArg = WebSetup | Sockets;

const isWebSetup = (v: undefined | Sockets | WebSetup): v is WebSetup =>
  typeof v === 'function';

const isSockets = (v: undefined | Sockets | WebSetup): v is Sockets =>
  typeof v === 'object';

const handersFrom = (sockets: Sockets): SocketHandler[] =>
  Object.entries(sockets).map(([path, setup]) => {
    const wss = new WebSocketServer({ noServer: true });
    setup(wss);
    return {
      path,
      wss,
    };
  });

export const stubRequests = async (
  ...args: [StubArg, StubArg?]
): Promise<Server> => {
  const app: Express = express();

  for (const arg of args) {
    if (isWebSetup(arg)) {
      arg(app);
    }
  }

  let handlers: SocketHandler[] = [];
  for (const arg of args) {
    if (isSockets(arg)) {
      handlers = handersFrom(arg);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.stack : err;
    res.status(500).send(message).end().flushHeaders();
  });

  const server = http.createServer(app);
  server.on('upgrade', doUpgrade(handlers));

  if (!port) {
    port = await getPort({ port: portNumbers(3000, 5000) });
  }

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve({
        port,
        host: `localhost:${port}`,
        close: async (): Promise<void> => {
          server.close();
          server.closeAllConnections();
        },
      });
    });
  });
};
