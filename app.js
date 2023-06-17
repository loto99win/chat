require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { });

// routes
const userRoute = require('./routes/userRoute');

// connect mongodb
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_DB)
    .then(() => console.log('Connection Established'))
    .catch((err) => console.log(err));


app.use('/', userRoute);

var userNamespace = io.of('/user-namespace');

userNamespace.on('connection', async (socket) => {

    //console.log(socket.handshake.auth.token);
    var userId = socket.handshake.auth.token;

    const user = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { isActive: 1 }}
    );

    console.log(user.name + ' : online');

    // user broadcast online status
    socket.broadcast.emit('getOnlineUser', { user_id: userId });

    socket.on('disconnect', async () => {

        var userId = socket.handshake.auth.token;

        const result = await User.findOneAndUpdate(
            { _id: userId },
            { $set: { isActive: 0 }}
        );

        // user broadcast offline status
        socket.broadcast.emit('getOfflineUser', { user_id: userId });

        console.log(result.name + ' : offline');
    });
});

httpServer.listen(process.env.PORT, () => console.log('http://localhost:2000'));