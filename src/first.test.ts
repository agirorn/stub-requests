import { suite } from 'sanna';
import assert from 'assert';
import WebSocket, { WebSocketServer } from 'ws';
import { stubRequests } from './index.js';
import type { Server, Sockets } from './index.js';

let server: Server;

let test = suite('Stub undici fetch');
test.after(async () => {
  await server.close();
});

const TEST_COUNT = 10;

for (let i = 0; i < TEST_COUNT; i++) {
  test('error handler', async () => {
    server = await stubRequests((app) => {
      app.get('/', (req, res, next) => {
        next(new Error('Something bad happend'));
      });
    });
    const response = await fetch(`http://${server.host}`, {
      method: 'get',
    });
    const requestBody = await response.text();
    assert.match(requestBody, new RegExp('Something bad happend'));
    assert.match(requestBody, new RegExp(' at '));
    assert.equal(response.status, 500);
  });
}

for (let i = 0; i < TEST_COUNT; i++) {
  test('ok handler', async () => {
    server = await stubRequests((app) => {
      app.get('/', (req, res) => {
        res.send('Its all OK');
      });
    });
    const res = await fetch(`http://${server.host}`, {
      method: 'get',
    });

    assert.equal(await res.text(), 'Its all OK');
    assert.equal(res.status, 200);
  });
}

test = suite('Stub undici fetch');
test.after(async () => {
  await server.close();
});

for (let i = 0; i < TEST_COUNT; i++) {
  test('error handler', async () => {
    server = await stubRequests((app) => {
      app.get('/', (req, res, next) => {
        next(new Error('Something bad happend'));
      });
    });
    const res = await fetch(`http://${server.host}`, {
      method: 'get',
    });
    assert.match(await res.text(), new RegExp('Something bad happend'));
    assert.equal(res.status, 500);
  });
}

for (let i = 0; i < TEST_COUNT; i++) {
  test('ok handler', async () => {
    server = await stubRequests((app) => {
      app.get('/', (req, res) => {
        res.send('Its all OK');
      });
    });
    const res = await fetch(`http://${server.host}`, {
      method: 'get',
    });

    assert.equal(await res.text(), 'Its all OK');
    assert.equal(res.status, 200);
  });
}

test = suite('websocket express style');

test('a single socket connection', async () => {
  const sockets: Sockets = {
    '/': (wss: WebSocketServer): void => {
      wss.on('connection', (ws) => {
        ws.on('message', (message: string) => {
          if (message) {
            ws.send('Result from the WebSocket');
          }
        });
      });
    },
  };
  const server = await stubRequests(sockets);

  const ws = new WebSocket(`ws://${server.host}/`);
  const result = new Promise<string>((resolve) => {
    ws.once('message', resolve);
  });
  ws.once('open', () => {
    ws.send('something');
  });

  assert.equal((await result).toString(), 'Result from the WebSocket');
  await server.close();
});

test = suite('websocket express style');

test('a single socket connection', async () => {
  const sockets: Sockets = {
    '/test': (wss: WebSocketServer): void => {
      wss.on('connection', (ws) => {
        ws.on('message', (message: string) => {
          if (message) {
            ws.send('Result from the WebSocket path /test');
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

  const ws1 = new WebSocket(`ws://${server.host}/test`);
  const result1 = new Promise<string>((resolve) => {
    ws1.once('message', resolve);
  });
  ws1.once('open', () => {
    ws1.send('something');
  });
  assert.equal(
    (await result1).toString(),
    'Result from the WebSocket path /test'
  );

  const ws2 = new WebSocket(`ws://${server.host}/path2`);
  const result2 = new Promise<string>((resolve) => {
    ws2.once('message', resolve);
  });
  ws2.once('open', () => {
    ws2.send('something');
  });
  assert.equal((await result2).toString(), 'Result from the WebSocket path2');

  await server.close();
});

test = suite('websocket express style');

test('a single socket connection', async () => {
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

  const ws1 = new WebSocket(`ws://${server.host}/test`);
  const result1 = new Promise<string>((resolve) => {
    ws1.once('message', resolve);
  });
  ws1.once('open', () => {
    ws1.send('something');
  });
  assert.equal((await result1).toString(), 'Result from the WebSocket');

  const ws2 = new WebSocket(`ws://${server.host}/path2`);
  const result2 = new Promise<string>((resolve) => {
    ws2.once('message', resolve);
  });
  ws2.once('open', () => {
    ws2.send('something');
  });
  assert.equal((await result2).toString(), 'Result from the WebSocket path2');

  await server.close();
});
