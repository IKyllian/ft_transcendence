import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from './Components/Home/Home';
import Sign from './Components/Sign';
import Profile from './Components/Profile/Profile';
import Leaderboard from './Components/Leaderboard/Leaderboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <Sign /> }/>
        <Route path='/home' element={ <Home /> }/>
        <Route path='/profile' element={ <Profile /> }/>
        <Route path='/leaderboard' element={ <Leaderboard /> }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
