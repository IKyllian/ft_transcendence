import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from './Components/Home/Home';
import Sign from './Components/Sign';
import Profile from './Components/Profile/Profile';
import Leaderboard from './Components/Leaderboard/Leaderboard';
import AddFriendModal from './Components/Add-Friend-Modal';
import Chat from './Components/Chat/Chat';

function App() {
  return (
    <>
      <AddFriendModal/>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={ <Sign /> }/>
          <Route path='/home' element={ <Home /> }/>
          <Route path='/profile' element={ <Profile /> }/>
          <Route path='/leaderboard' element={ <Leaderboard /> }/>
          <Route path='/chat' element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
