import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from './Components/Home/Home';
import Sign from './Components/Sign';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <Sign /> }/>
        <Route path='/home' element={ <Home /> }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
