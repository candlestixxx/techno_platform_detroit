const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST"]
    }
  });

  const cookie = require("cookie");
  const { decode } = require("next-auth/jwt");

  // Middleware to ensure socket connection is authenticated via next-auth session cookie
  io.use(async (socket, next) => {
    if (socket.handshake.headers.cookie) {
      const cookies = cookie.parse(socket.handshake.headers.cookie);
      // next-auth uses next-auth.session-token (or __Secure-next-auth.session-token in prod)
      const sessionToken = cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"];

      if (sessionToken) {
        try {
          const secret = process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_scaffolding";
          const decoded = await decode({ token: sessionToken, secret });
          if (decoded) {
            socket.user = decoded; // Attach user to socket
            return next();
          }
        } catch (err) {
          console.error("Socket JWT Decode error", err);
        }
      }
    }
    return next(new Error("Authentication error: session missing or invalid"));
  });

  io.on("connection", (socket) => {
    console.log("Authenticated client connected:", socket.id);

    socket.on("join_event_room", (eventId) => {
      socket.join(`event_${eventId}`);
    });

    socket.on("leave_event_room", (eventId) => {
      socket.leave(`event_${eventId}`);
    });

    socket.on("send_message", (data) => {
      // Ensure the user broadcasting the message is the actual author
      if (socket.user && data.authorId && socket.user.sub === data.authorId) {
         socket.to(`event_${data.eventId}`).emit("new_message", data);
      } else {
         console.warn(`Blocked unauthorized message broadcast attempt from socket ${socket.id}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  server.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
