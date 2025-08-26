import React, { createContext, useContext, useMemo } from 'react'
import {io} from "socket.io-client";

const socketContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () =>{
    const socket = useContext(socketContext);
    return socket;
}

export const SocketProvider=(props)=> {
    const socket = useMemo(()=> io("localhost:8080"),[]);

  return (
    <socketContext.Provider value={socket}>
      {props.children}
    </socketContext.Provider>
  )
}
