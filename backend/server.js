const express = require("express");
const dotenv = require("dotenv");
const connectionDB = require("./config/db");
const userRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require("./routes/message.routes");
const cors = require('cors');

const app = express();
dotenv.config();
connectionDB();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    console.log("Welcome to Chat App");
    res.send("Welcome to Chat App");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const port = process.env.PORT || 8001;
const server = app.listen(port, () => console.log("Server is running at port:", port));

const io = require("socket.io")(server, {
    cors: {
        origin: "https://chat-app-a33u.vercel.app",
    },
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
    });

    socket.on("new message", (newMessageRec) => {
        let chat = newMessageRec.chat;
        if (!chat || !chat.users) {
            console.log("Chat users not defined");
            return;
        }

        chat.users.forEach(user => {
            if (user !== newMessageRec.sender._id) {
                socket.in(user).emit("message received", newMessageRec);
            }
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});
