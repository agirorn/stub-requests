# stub-requests

> Stub out webserver request like http and WebSocket messages for testing
> purposes

## API

```typescript
  /**
   * All non stubbed routes end in HTTP 404
   */
  import { stubRequests } from "stub-requests"
  import type { Server } from "stub-requests"

  server: Server = await stubRequests((app) => {
    app.get('/path', (req, res) => {
      res.send('Its all OK');
    });
  });
  const res = await fetch(`http://localhost:${server.port}/path`, {
    method: 'get',
  });

  assert.equal(await res.text(), 'Its all OK');
  assert.equal(res.status, 200);

  await server.close();
```

## API WebSocet

```typescript
  const sockets: Sockets = {
    '/test': (wss: WebSocketServer): void => {
      wss.on('connection', (ws) => {
        ws.on('message', (message: string) => {
          if (message) {
            ws.send('Result from the WebSocket');
          }
        });
      });
    },
    '/path2': (wss: WebSocketServer): void => {
      wss.on('connection', (ws) => {
        ws.on('message', (message: string) => {
          if (message) {
            ws.send('Result from the WebSocket path2');
          }
        });
      });
    },
  };

  const server = await stubRequests(sockets);

  const ws1 = new WebSocket(`ws://localhost:${server.port}/test`);
  const result1 = new Promise<string>((resolve) => {
    ws1.once('message', resolve);
  });
  ws1.once('open', () => {
    ws1.send('something');
  });
  assert.equal((await result1).toString(), 'Result from the WebSocket');

  const ws2 = new WebSocket(`ws://localhost:${server.port}/path2`);
  const result2 = new Promise<string>((resolve) => {
    ws2.once('message', resolve);
  });
  ws2.once('open', () => {
    ws2.send('something');
  });
  assert.equal((await result2).toString(), 'Result from the WebSocket path2');

  await server.close();
```
