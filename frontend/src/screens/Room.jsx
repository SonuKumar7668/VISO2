import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import peer from '../service/peer';

export default function Room() {
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState(null);
  const socket = useSocket();

  //when a new user joins
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined the room`);
    setRemoteSocketId(id);
  }, []);

  //when someone calls you
  const handleIncommingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    setMyStream(stream);
    if (videoRef.current) {
      console.log("available video current");
      videoRef.current.srcObject = stream;
    }
    console.log("incomming call", from, offer);
    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans })
  }, [socket]);

  const sendStream = useCallback(() => {

    if(!myStream) return;
    myStream.getTracks().forEach((track) => {
      peer.peer.addTrack(track, myStream);
    });
  }, [myStream]);

  const handleCallAccepted = useCallback(({ ans }) => {
    peer.setLocalDescription(ans);
    sendStream();
  }, [sendStream]);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId })
  }, [remoteSocketId,socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    }
  }, [handleNegoNeeded]);

  const handleNegoIncomming = useCallback(async ({ from, offer }) => {
    const ans = await peer.getAnswer(offer);
    socket.emit("peer:nego:done", { to: from, ans })
  }, [socket]);

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  // useEffect(() => {
  //   peer.peer.addEventListener("track", async (ev) => {
  //     const remoteStream = ev.streams;
  //     console.log("got tracks");
  //     setRemoteStream(remoteStream);
  //     if(remoteVideoRef){
  //     remoteVideoRef.current.srcObject = remoteStream[0];
  //     }
  //   });
  // },[]);

  useEffect(() => {
    if (!peer?.peer) return;
  
    const handleTrack = (ev) => {
      const remoteStream = ev.streams[0];
      console.log("🎥 Got remote track:", remoteStream);
      setRemoteStream(remoteStream);
  
      // Check if ref exists and video is mounted
      if (remoteVideoRef.current) {
        console.log("remoteVideoRef is available, setting srcObject");
        remoteVideoRef.current.srcObject = remoteStream;
      }else{
        console.log("videoref is null: ",remoteStream);
      }
    };
  
    peer.peer.addEventListener("track", handleTrack);
  
    // Cleanup listener when component unmounts
    return () => {
      peer.peer.removeEventListener("track", handleTrack);
    };
  }, []);
  

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    }
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegoIncomming, handleNegoNeedFinal])

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setMyStream(stream);
    if(videoRef.current){
      videoRef.current.srcObject = stream;
    }
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    if (myStream && videoRef.current) {
      videoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  return (
    <div>
      <h1>Room page</h1>
      <h4>{remoteSocketId ? "Someone connected" : "no one in room"}</h4>
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && <button onClick={sendStream}>send Stream</button>}
      <h4>My Stream</h4>
      {myStream &&
        <video autoPlay muted style={{ width: "200px", border: "2px solid red" }} ref={videoRef} />
      }
      <h4>Remote Stream</h4>
      
        <video autoPlay muted style={{ width: "200px", border: "2px solid red" }} ref={remoteVideoRef} />
    </div>
  )
}
