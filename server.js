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

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_event_room", (eventId) => {
      socket.join(`event_${eventId}`);
      console.log(`Socket ${socket.id} joined room event_${eventId}`);
    });

    socket.on("leave_event_room", (eventId) => {
      socket.leave(`event_${eventId}`);
      console.log(`Socket ${socket.id} left room event_${eventId}`);
    });

    socket.on("send_message", (data) => {
      // Broadcast to everyone in the room except the sender
      // The sender gets the message directly added to their UI optimistically
      socket.to(`event_${data.eventId}`).emit("new_message", data);
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
