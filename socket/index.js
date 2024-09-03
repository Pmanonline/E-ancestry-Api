const { Server } = require("socket.io");

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  // Add new user
  socket.on("addNewUser", (userId) => {
    const existingUserIndex = onlineUsers.findIndex(
      (user) => user.userId === userId
    );

    if (existingUserIndex === -1) {
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });
    } else {
      onlineUsers[existingUserIndex].socketId = socket.id;
    }

    console.log("onlineUsers =", onlineUsers);

    // Emit the updated online users list to all clients
    io.emit("getOnlineUsers", onlineUsers);
  });

  // add Message
  // socket.on("sendMessage", (message) => {
  //   const user = onlineUsers.find(
  //     (user) => user.userId === message.recipientId
  //   );

  //   if (user) {
  //     io.to(user.socketId).emit("getMessage", message);
  //     io.to(user.socketId).emit("getNotification", {
  //       senderId: message.senderId,
  //       isRead: false,
  //       date: new Date(),
  //     });
  //   }
  // });
  socket.on("sendMessage", (message) => {
    console.log("Received sendMessage event:", message);

    const user = onlineUsers.find(
      (user) => user.userId === message.recipientId
    );

    if (user) {
      console.log("User found, sending message and notification:", user);

      io.to(user.socketId).emit("getMessage", message);

      io.to(user.socketId).emit("getNotification", {
        senderId: message.senderId,
        isRead: false,
        date: new Date(),
      });
    } else {
      console.log("User not found or not online:", message.recipientId);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);

    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

    console.log("Updated onlineUsers =", onlineUsers);

    // Emit the updated online users list to all clients
    io.emit("getOnlineUsers", onlineUsers);
  });
});

io.listen(3001);

console.log("Socket.IO server running on port 3001");
