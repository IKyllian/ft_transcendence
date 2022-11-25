import { createContext } from "react";
import { Routes, Route } from "react-router-dom";
import { Socket } from "socket.io-client";
import { useAppHook } from "./Hooks/App-Hook";

import Header from "./Components/Header/Header";
import Home from './Components/Home/Home';
import Sign from './Components/Sign/Sign';
import ResetPassword from './Components/Sign/Reset-Password';
import Profile from './Components/Profile/Profile';
import Leaderboard from './Components/Leaderboard/Leaderboard';
import AddFriendModal from './Components/Friends-Modal';
import Chat from './Components/Chat/Chat';
import ChannelSettings from './Components/Chat/Channel-Settings/Settings-Container';
import ChatChannel from "./Components/Chat/Chat-Section/Chat-Channel";
import ChatPrivateMessage from "./Components/Chat/Chat-Section/Chat-Private-Message";
import Error404 from "./Components/404-Error";
import { ModalProvider } from "./Components/Utils/ModalProvider";
import PublicRoute from "./Route/Public-Route";
import PrivateRoute from "./Route/Private-Route";
import UsernameForm from "./Components/Sign/Username-Form";
import ChannelsList from "./Components/Chat/Channels-List";
import NotifGameInvite from "./Components/Notif-Game-Invite";
import NotifError from "./Components/Notif-Error";
import Game from "./Components/Game/Game";
import Lobby from "./Components/Lobby/Lobby";
import ModalPartyInvite from "./Components/Modal-Party-Invite";
import CodeVerification from "./Components/Sign/Code-Verification";
import ChatParty from "./Components/Chat-Party";
import MatchFound from "./Components/Lobby/Match-Found";
import ProfileSettings from "./Components/Profile/Settings/Profile-Settings";

interface RouteProps {
	path: string,
	element: JSX.Element,
}
interface SocketContextType {
	socket: Socket | undefined;
}

interface CacheContextType {
	cache: Cache | undefined; 
}

const routes: RouteProps[] = [
	{
		path: '/',
		element:
			<PrivateRoute>
				<Home />
			</PrivateRoute>,
	}, {
		path: '/sign',
		element:
			<PublicRoute>
				<Sign />
			</PublicRoute>,
	}, {
		path: '/account-verification',
		element:
			<PublicRoute>
				<CodeVerification />
			</PublicRoute>,
	}, {
		path: '/set-username',
		element:
			<PublicRoute>
				<UsernameForm />
			</PublicRoute>,
	}, {
		path: '/profile/:username',
		element:
			<PrivateRoute>
				<Profile />
			</PrivateRoute>,
	}, {
		path: '/profile/:username/settings',
		element:
			<PrivateRoute>
				<ProfileSettings />
			</PrivateRoute>,
	}, {
		path: '/leaderboard',
		element:
			<PrivateRoute>
				<Leaderboard />
			</PrivateRoute>,
	},
	{
		path: '/chat/channel/:channelId/settings',
		element:
			<PrivateRoute>
				<ChannelSettings />
			</PrivateRoute>,
	}, {
		path: '/game',
		element:
			<div id="game_anchor">
				<PrivateRoute>
					<Game />
				</PrivateRoute>,
			</div>
	}, {
		path: '/lobby',
		element:
			<PrivateRoute>
				<Lobby />
			</PrivateRoute>,
	},
	{
		path: '*',
		element:
			<PrivateRoute>
				<Error404 />
			</PrivateRoute>
	},
]

export const SocketContext = createContext<SocketContextType>({socket: undefined});
export const CacheContext = createContext<CacheContextType>({cache: undefined});

function App() {
	const {
		socket,
		cache,
		eventError,
		closeEventError,
		isAuthenticated,
		partyState,
	} = useAppHook();

  return (
	<div className="app-container">
		<SocketContext.Provider value={{socket: socket}} >
			<CacheContext.Provider value={{cache: cache}} >
				<ModalProvider>
					{ isAuthenticated && eventError !== undefined && <NotifError error={eventError} closeError={closeEventError} />}
					{ isAuthenticated && <AddFriendModal/> }
					{ isAuthenticated && <ModalPartyInvite /> }
					{ isAuthenticated && <NotifGameInvite /> }
					{/* { isAuthenticated && <MatchFound /> } */}
					{ isAuthenticated && <Header /> }
					<main className="page-container">
						{ isAuthenticated && partyState.party && partyState.chatIsOpen && <ChatParty />}
						<Routes>
							{
								routes.map((elem, index) => 
									<Route key={index} path={elem.path} element={elem.element} />
								)
							}
							<Route
								path='/chat'
								element= {
									<PrivateRoute>
										<Chat />
									</PrivateRoute>
								}
							>
								<Route
									path="channel/:channelId"
									element= {
										<PrivateRoute>
											<ChatChannel />
										</PrivateRoute>
									}
								/>
								<Route
									path="private-message/:convId"
									element= {
										<PrivateRoute>
											<ChatPrivateMessage />
										</PrivateRoute>
									}
								/>
								{/* <Route
									path="channel/:channelId/settings"
									element= {
										<PrivateRoute>
											<ChannelSettings />
										</PrivateRoute>
									}
								/> */}
								<Route
									path="channels-list"
									element= {
										<PrivateRoute>
											<ChannelsList />
										</PrivateRoute>
									}
								/>
							</Route>
						</Routes>
					</main>
				</ModalProvider>
			</CacheContext.Provider>
		</SocketContext.Provider>
    </div>
  )
}

export default App;
