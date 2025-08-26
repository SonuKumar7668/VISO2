const {Server} = require("socket.io");
const cors = require("cors");

//cors();

const io = new Server(8080,{
    cors:true,
});
let a = 5;

const emailToSocketMap = new Map();
const socketToEmailMap = new Map();

io.on("connection", (socket)=>{
    socket.on("room:join",(data) => {
        const {email,room } = data;
        emailToSocketMap.set(email,room);
        socketToEmailMap.set(room,email);
        io.to(room).emit("user:joined",{email,id:socket.id});
        socket.join(room);
        io.to(socket.id).emit("room:join",data);
    });

    socket.on("user:call", ({to,offer}) =>{
        io.to(to).emit("incomming:call", {from: socket.id, offer})
    });

    socket.on("call:accepted",({to,ans})=>{
        io.to(to).emit("call:accepted",{from: socket.id,ans});
    })

    socket.on("peer:nego:needed",({to,offer})=>{
        io.to(to).emit("peer:nego:needed",{from: socket.id,offer})
    })

    socket.on("peer:nego:done",({to, ans})=>{
        io.to(to).emit("peer:nego:final",{from:socket.id,ans});
    })
})