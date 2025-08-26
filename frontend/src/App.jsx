import './App.css'
import {BrowserRouter, Routes, Route} from "react-router";
import LobbyScreen from './screens/LobbyScreen';
import { SocketProvider } from './context/SocketProvider';
import Room from './screens/Room';

function App() {
  return (
    <>
    <SocketProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyScreen/>}/>
        <Route path="/room/:roomid" element={<Room/>}/>
      </Routes>
    </BrowserRouter>
    </SocketProvider>
    </>
  )
}

export default App
