import { useEffect, createContext, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./Components/Header/Header";
import Home from './Components/Home/Home';
import Sign from './Components/Sign/Sign';
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

import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from './Redux/Hooks'
import { socketUrl } from "./env";
import { fetchNotifications } from "./Api/User-Fetch";
import { NotificationInterface } from "./Types/Notification-Types";
import { addNotification } from "./Redux/NotificationSlice";

interface RouteProps {
	path: string,
	element: JSX.Element,
}
interface SocketContextType {
	socket : Socket | undefined;
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
		path: '/leaderboard',
		element:
			<PrivateRoute>
				<Leaderboard />
			</PrivateRoute>,
	}, {
		path: '/chat/channel/:channelId/settings',
		element:
			<PrivateRoute>
				<ChannelSettings />
			</PrivateRoute>,
	}, {
		path: '*',
		element:
			<PrivateRoute>
				<Error404 />
			</PrivateRoute>
	},
]

export const SocketContext = createContext<SocketContextType>({socket: undefined});

function App() {
	const [socket, setSocket] = useState<Socket | undefined>(undefined);
	const [gameInvite, setGameInvite] = useState<boolean>(false);
    const {token, isAuthenticated} = useAppSelector((state) => state.auth);
	const dispatch = useAppDispatch();

	const connectSocket = () => {
		const newSocket: Socket = io(`${socketUrl}`, {extraHeaders: {
			"Authorization": `Bearer ${token}`,
		}});
		setSocket(newSocket);
	}

	const gameNotificationLeave = () => {
		setGameInvite(false);
	}

	useEffect(() => {
		if (isAuthenticated && socket === undefined) {
			connectSocket();
			fetchNotifications(token, dispatch);
			// setTimeout(function() {
			// 	setGameInvite(true);
			// 	setTimeout(function() {
			// 		gameNotificationLeave();
			// 	}, 15000);
			// }, 2000);
		}
	}, [isAuthenticated])

	useEffect(() => {
		if (socket !== undefined) {
			socket!.on("NewNotification", (data: NotificationInterface) => {
				console.log("NewNotification", data);
				dispatch(addNotification(data));
			});
		}

		return () => {
			socket?.off("NewNotification")
		}
	}, [socket])
  return (
	<div className="app-container">
    	<BrowserRouter>
			<SocketContext.Provider value={{socket: socket}} >
				<ModalProvider>
					<AddFriendModal/>
					{ gameInvite && <NotifGameInvite notifOnLeave={gameNotificationLeave} /> }
					<Header />
					<main className="page-container">
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
			</SocketContext.Provider>
    	</BrowserRouter>
    </div>
  );
}

export default App;
