import { createContext } from "react";
import { Socket } from "socket.io-client";
import { useAppHook } from "./Hooks/App-Hook";

import Header from "./Components/Header/Header";
import AddFriendModal from './Components/Friends-Modal';
import { ModalProvider } from "./Components/Utils/ModalProvider";
import NotifGameInvite from "./Components/Notif-Game-Invite";
import ModalPartyInvite from "./Components/Modal-Party-Invite";
import ChatParty from "./Components/Chat-Party";
import MatchFound from "./Components/Lobby/Match-Found";
import Alert from "./Components/Alert";
import LoadingSpin from "./Components/Utils/Loading-Spin";
import Router from "./Route/Router";
import ResumeGame from "./Components/Resume-Game";

interface SocketContextType {
	socket: Socket | undefined;
}

interface CacheContextType {
	cache: Cache | undefined | null; 
}

export const SocketContext = createContext<SocketContextType>({socket: undefined});
export const CacheContext = createContext<CacheContextType>({cache: undefined});

function App() {
	const {
		socket,
		cache,
		isAuthenticated,
		partyState,
		isSign,
	} = useAppHook();

  return !isAuthenticated && isSign ? (
	<div className="app-container">
		<LoadingSpin />
	</div>
  ) : (
	<div className="app-container">
		<SocketContext.Provider value={{socket: socket}} >
			<CacheContext.Provider value={{cache: cache}} >
				<ModalProvider>
					{ isAuthenticated && <Alert /> }
					{ isAuthenticated && <AddFriendModal/> }
					{ isAuthenticated && <ModalPartyInvite /> }
					{ isAuthenticated && <NotifGameInvite /> }
					{ isAuthenticated && <MatchFound /> }
					{ isAuthenticated && <Header /> }
					{ isAuthenticated && <ResumeGame /> }
					<main className="page-container">
						{ isAuthenticated && partyState.party && partyState.chatIsOpen && <ChatParty />}
						<Router />
					</main>
				</ModalProvider>
			</CacheContext.Provider>
		</SocketContext.Provider>
    </div>
  );
}

export default App;
