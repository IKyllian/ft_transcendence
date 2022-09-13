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
import PublicRoute from "./Route/Public-Route";
import PrivateRoute from "./Route/Private-Route";

interface RouteProps {
	path: string,
	element: JSX.Element,
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
		path: '/profile',
		element:
			<PrivateRoute>
				<Profile />
			</PrivateRoute>,
	},  {
		path: '/leaderboard',
		element:
			<PrivateRoute>
				<Leaderboard />
			</PrivateRoute>,
	},  {
		path: '/chat/:channelId/settings',
		element:
			<PrivateRoute>
				<ChannelSettings />
			</PrivateRoute>,
	}
]

function App() {
  return (
	<div className="app-container">
    	<BrowserRouter>
        	<ModalProvider>
				<AddFriendModal/>
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
								path=":chatId"
								element= {
									<PrivateRoute>
										<ChatElement />
									</PrivateRoute>
								}
							/>
						</Route>
						<Route
							path='*'
							element= {
								<PrivateRoute>
									<Error404 />
								</PrivateRoute>
							}
						/>
					</Routes>
				</main>
        	</ModalProvider>
    	</BrowserRouter>
    </div>
  );
}

export default App;
