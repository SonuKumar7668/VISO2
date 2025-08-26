import React, { useCallback } from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router';
import { useSocket } from '../context/SocketProvider';

export default function LobbyScreen() {
    const [email,setEmail] = useState("");
    const [room, setRoom] = useState("");
    const navigate = useNavigate();

    const socket= useSocket();

    const handleSubmit = useCallback((e) =>{
        e.preventDefault();
        socket.emit("room:join",{email,room})
    },[email,room,socket]);

    const handleRoomJoin = useCallback((data)=>{
      const {room} = data;
      navigate(`/room/${room}`);
    },[navigate])

    useEffect(()=>{
      socket.on("room:join",handleRoomJoin)
      return ()=>{
        socket.off("room:join");
      }
    },[socket]);

  return (
    <div>
      <h1>LobbyScreen</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor='email'>Email</label>
        <input type='email' id="email" name="email" value={email} onChange={(e)=> setEmail(e.target.value)} placeholder='email'/> <br/>
        <label htmlFor='roomId'>Room Id</label>
        <input type='text' id="roomId" value={room} onChange={(e)=> setRoom(e.target.value)} placeholder='Room Id'/><br/>
        <button type='submit'>Submit</button>
      </form>
    </div>
  )
}
