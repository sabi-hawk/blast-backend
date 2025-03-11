import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from "helmet";
import path from 'path';
import dotenv from "dotenv";
import apiRouter from './routes';
import { Server } from "socket.io";

type socketUser = {
  userId: string,
  socketId: string
}

dotenv.config()

const app = express();
const port = process.env.PORT || 8001;

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

const corsOptions = {
  origin: ['http://example.com', 'http://localhost:3000'],
};

app.use(cors(corsOptions));
app.disable('x-powered-by');
app.use("/api", apiRouter);


// Define your custom middleware
app.use((req, res, next) => {
  console.log(`Received a ${req.method} request at ${req.url}`);
  next();
});

app.use("/images", express.static(path.join(__dirname, '../../uploads')))

if (!process.env.MONGO_DB_CONNECTION_STRING) {
  throw new Error('MONGO_DB_CONNECTION_STRING is not defined in environment variables');
}

mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING)
  .then(() => {
    console.log('Connected to Database');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Blast API' });
});


// Create HTTP server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




// Initialize Socket.IO
const socket = new Server(server);

let activeUsers: Array<socketUser> = [];
socket.on('connection', (client) => {
  client.on('new-user-add', (newUserId) => {
    if (!activeUsers.some((user: socketUser) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: client.id
      })
    }
    console.log("Connected Users", activeUsers);
    socket.emit('get-users', activeUsers);
  })

  client.on('send-message', (data: any) => {
    // const { receiverId } = data;
    const user = activeUsers.find((user) => user.socketId !== client.id)
    if (user) {
      socket.to(user.socketId).emit("receive-message", data)
    }
  })

  client.on('send-notification', (data: any) => {
    console.log("Active Users", activeUsers)
    const { userId } = data;
    const user = activeUsers.find((user) => user.userId === userId)
    console.log("Inside SND NOTIFICATION", user)
    if (user) {
      socket.to(user.socketId).emit("receive-notification", data)
    }
  })
  client.on('disconnect', () => {
    activeUsers = activeUsers.filter((user: socketUser) => user.socketId !== client.id)
    socket.emit('get-users', activeUsers);
  })
})