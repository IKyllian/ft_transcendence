import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./Components/Header/Header";
import Home from './Components/Home/Home';
import Sign from './Components/Sign/Sign';
import Profile from './Components/Profile/Profile';
import Leaderboard from './Components/Leaderboard/Leaderboard';
import AddFriendModal from './Components/Add-Friend-Modal';
import Chat from './Components/Chat/Chat';
import ChannelSettings from './Components/Chat/Channel-Settings/Settings-Container';
import ChatElement from "./Components/Chat/Message-Section/Chat-Element";
import Error404 from "./Components/404-Error";
import { ModalProvider } from "./Components/ModalProvider";

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <ModalProvider>
          <AddFriendModal/>
          <Header />
          <main className="page-container">
            <Routes>
              <Route path='/' element={ <Sign /> }/>
              <Route path='/home' element={ <Home /> }/>
              <Route path='/profile' element={ <Profile /> }/>
              <Route path='/leaderboard' element={ <Leaderboard /> }/>
              <Route path='/chat' element={<Chat />}>
                <Route path=":chatId" element={<ChatElement />}/>
              </Route>
              <Route path='/chat/:channelId/settings' element={ <ChannelSettings /> }/>
              <Route path='*' element={ <Error404 /> } />
            </Routes>
          </main>
        </ModalProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
