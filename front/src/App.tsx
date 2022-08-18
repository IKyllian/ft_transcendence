import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from './Components/Home/Home';
import Sign from './Components/Sign';
import Profile from './Components/Profile/Profile';
import Leaderboard from './Components/Leaderboard/Leaderboard';
import AddFriendModal from './Components/Add-Friend-Modal';

function App() {
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  console.log(setModalIsOpen);
  return (
    <>
      {
        modalIsOpen && <AddFriendModal modalIsOpen={setModalIsOpen} />
      }
     <BrowserRouter>
      <Routes>
        <Route path='/' element={ <Sign /> }/>
        <Route path='/home' element={ <Home modalIsOpen={setModalIsOpen} blurClass={modalIsOpen ? "blur-background" : ""} /> }/>
        <Route path='/profile' element={ <Profile modalIsOpen={setModalIsOpen} blurClass={modalIsOpen ? "blur-background" : ""} /> }/>
        <Route path='/leaderboard' element={ <Leaderboard modalIsOpen={setModalIsOpen} blurClass={modalIsOpen ? "blur-background" : ""} /> }/>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
