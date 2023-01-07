# stub-request

> Stub out http request for testing purposes

## API

```typescript
  import type { Trades } from "../../src/types.js";
  import { suite } from 'sanna';
  import stubRequest from 'stub-request';
  import type { Application, Request, response } from 'stub-request';

  stubRequest.blockAllNetworkTrafic = true;

  /**
   * All non stubbed routes end in HTTP 404
   */
  stubRequest.to('https://api.binance.com', (app: Application) => {
    app.get('/api/v3/trades', (req: Request, res: Response) => {
      // The request will resolve to an HTTP 500  error if the assertaion fails
      // and the original error will be printed to the console
      assert(
        req.query,
        {
          symbol: 'BTCBUSD',
          limit: 10,
        }
      );
      // The request will resolve to an HTTP 500  error if the assertaion fails
      // and the original error will be printed to the console
      assert(req.headers['content-type'], 'application/json'),
      // The request will resolve to an HTTP 500  error if the assertaion fails
      // and the original error will be printed to the console
      assert(req.headers['Accept'], 'application/json'),
      // res.statusCode = 200; // Not needed since `res.sendJSON` does it.
      res.sendJSON([
        {
          id: 28457,
          price: '4.00000100',
          qty: '12.00000000',
          quoteQty: '48.000012',
          time: 1499865549590,
          isBuyerMaker: true,
          isBestMatch: true,
        },
      ]);
    });
  });

  const test = suite('Binance API');
  test("get trades", () => {
    const tradres = JSON.parse(
      await got("https://api.binance.com/api/v3/trades", {
        searchParams: {
          symbol: 'BTCBUSD',
          limit: 10,
        },
        headers: {
          'content-type': 'application/json',
          'Accept': 'application/json',
        },
      })
    ).body) as Trades;

    assert.deepStrictEqual<Trades>(
      tradres,
      [
        {
          id: 28457,
          price: '4.00000100',
          qty: '12.00000000',
          quoteQty: '48.000012',
          time: 1499865549590,
          isBuyerMaker: true,
          isBestMatch: true,
        },
      ]
    );
  });

```

## API WebSocet

```typescript
  import type { Trades } from "../../src/types.js";
  import { suite } from 'sanna';
  import stubRequest from 'stub-request';
  import type { Application, Request, response } from 'stub-request';

  stubRequest.webSocket('wss://api.binance.com', (socket: WebSocket) => {
     socket.on('connect', (client) => {
       client.on('message', (msg) => {

       });
     });
     socket.on('disconect', (client) => {
     });
  });
```
