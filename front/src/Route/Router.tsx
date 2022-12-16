import { Route, Routes } from "react-router-dom";
import Home from '../Components/Home/Home';
import Sign from '../Components/Sign/Sign';
import ResetPassword from '../Components/Sign/Reset-Password';
import Profile from '../Components/Profile/Profile';
import Leaderboard from '../Components/Leaderboard/Leaderboard';
import Chat from '../Components/Chat/Chat';
import ChannelSettings from '../Components/Chat/Channel-Settings/Settings-Container';
import ChatChannel from "../Components/Chat/Chat-Section/Chat-Channel";
import ChatPrivateMessage from "../Components/Chat/Chat-Section/Chat-Private-Message";
import Error404 from "../Components/404-Error";
import PublicRoute from "./Public-Route";
import PrivateRoute from "./Private-Route";
import UsernameForm from "../Components/Sign/Username-Form";
import ChannelsList from "../Components/Chat/Channels-List";
import Game from "../Components/Game/Game";
import Lobby from "../Components/Lobby/Lobby";
import CodeVerification from "../Components/Sign/Code-Verification";
import ProfileSettings from "../Components/Profile/Settings/Profile-Settings";
import SendMailPassword from "../Components/Sign/Send-Mail-Password";

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
		path: '/forgot-password',
		element:
			<PublicRoute>
				<SendMailPassword />
			</PublicRoute>,
	}, {
		path: '/reset-password',
		element:
			<PublicRoute>
				<ResetPassword />
			</PublicRoute>,
	}, {
		path: '/2fa-verification',
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
		path: '/profile/settings',
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
				</PrivateRoute>
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

function Router() {
    return (
        <>
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
        </>
       
    );
}

export default Router;