const app = require('express')();
const http = require('http').createServer(app);
const Room = require('./models/Room')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const io = require('socket.io')(http, {
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});


dotenv.config();
app.use(morgan('[:date[web]] || :method :url  || Status: :status || Response time: :response-time ms'));
app.use(cors())

const MONGOOSE_OPTIONS = {useNewUrlParser: true, useUnifiedTopology: true};
mongoose.connect(process.env.DB_CONNECTION, MONGOOSE_OPTIONS, () => {
    console.log('Connected to MongoDB database');
});

io.origins('*:*') // for latest version

io.on('connection', (socket) => {
    socket.on('initialize', async (users) => {
        let oldMessages = await Room.findOne({users});
        console.log(users);
        if (!oldMessages) {
            const room = new Room({
                users,
                messages: [],
            });
            await room.save();
        }
        io.emit('load messages',oldMessages);
        socket.on('new message', async (data) => {
            console.log(data);
            const room = await Room.findOne({users: users});
            room.messages = [...room.messages, {content: data.message, sentBy: data.sentBy}];
            console.log(room);
            //await room.save();
            let allMessages = await Room.findOne({users});
            io.emit('load messages',allMessages);
        });

    });


});
const PORT = process.env.PORT || '3000';
http.listen(PORT, () => {
    console.log('listening on *:3000');
});