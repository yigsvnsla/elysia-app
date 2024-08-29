import { Elysia, Static, t } from "elysia";

const GameRoom = t.Object({
  id: t.String(),
  host: t.String(),
  playerCount: t.Union([t.Literal(2), t.Literal(3), t.Literal(4)]),
  gameMode: t.Union([t.Literal(1), t.Literal(2)]),
  hostNickname: t.String(),
  players: t.Array(t.String()),
});

type GameRoom = Static<typeof GameRoom>;

const CreateGameRoom = t.Object({
  hostNickname: t.String(),
  playerCount: t.Union([t.Literal(2), t.Literal(3), t.Literal(4)]),
  gameMode: t.Union([t.Literal(2), t.Literal(1)]),
});

type CreateGameRoom = Static<typeof CreateGameRoom>;

const JoinGameRoom = t.Object({
  playerNickname: t.String(),
  roomId: t.String(),
});

type JoinGameRoom = Static<typeof JoinGameRoom>;

const rooms = new Map<string, GameRoom>();

const app = new Elysia()

  .get("/list-tables", (ctx) => {
    ctx.set.status = 200;
    return [...rooms.values()];
  })

  .post(
    "/join-table",
    (ctx) => {
      const { playerNickname, roomId } = ctx.body;
      if (rooms.get(roomId)) rooms.get(roomId)?.players.push(playerNickname);
      ctx.set.status = 200;
      return { roomId, message: "Ingreso a sala con éxito" };
    },
    {
      body: JoinGameRoom,
    }
  )

  .post(
    "/create-table",
    (ctx) => {
      const roomId = Math.random().toString(36).substring(7);
      
      console.log(ctx.body);
      
      const { playerCount, hostNickname, gameMode } = ctx.body;

      rooms.set(roomId, {
        id: roomId,
        host: hostNickname,
        gameMode,
        playerCount,
        hostNickname,
        players: [],
      });

      ctx.set.status = 201;
      return { roomId, message: "Sala creada con éxito" };
    },
    {
      body: CreateGameRoom,
    }
  )
  .ws("/game", {
    body: t.String(),
    response: t.String(),
    open(ws) {
      ws.data.set.headers["custom-cokkie"] = "$SESSION_123123";
      console.log("Socket open event global");
    },
    close(ws, code, message) {
      console.log("Socket close event global");
    }, // a socket is closed
    message(ws, message) {
      // ws.publish("")

      ws.send(`message: ${message}`);
    },
  })
  .listen(4000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
