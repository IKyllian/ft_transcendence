import { useEffect, useState, useContext } from "react";
import { Channel } from "../../Types/Chat-Types";
import LoadingSpin from "../Utils/Loading-Spin";
import { useAppSelector } from "../../Redux/Hooks";
import { IconPlus, IconChevronRight } from "@tabler/icons";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { SidebarContext } from "./Chat";
import { SocketContext } from "../../App";
import { fetchVisibleChannels } from "../../Api/Chat/Chat-Fetch";

function ChannelItem(props: {channelData: Channel, token: string}) {
    const { register, handleSubmit, formState: {errors} } = useForm<{password?: string}>();
    const { channelData, token } = props;
    const navigate = useNavigate();
    const {socket} = useContext(SocketContext);

    const handleClick = handleSubmit((data, e) => {
        e?.preventDefault();
        let body: {password?: string};
        if (data.password)
            body = {password: data.password};
        else
            body = {};
        socket?.emit("JoinChannel", {id: channelData.id, pwdDto: body});
        setTimeout(function() {
            navigate(`/chat/channel/${channelData.id}`);
		}, 50);
    })

    useEffect(() => {
        socket!.on('exception', (data: any) => {
            console.log("exception", data);
        });

        return () => {
            socket?.off('exception');
        }
    }, [])

    return (
        <div className="channels-card-wrapper">
            <div className="channel-banner"></div>
            <div className="card-content">
                <p className="channel-name"> { channelData.name } <span>({ channelData.option })</span> </p>
                <p className="channel-description"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis porta libero, vitae feugiat sem. Aenean porttitor diam non sem congue, vitae euismod diam venenatis. </p>
                <div className="item-bottom">
                    <p> {channelData.channelUsers.length} members </p>
                    <div className="item-bottom-right">
                        {
                            channelData.option === 'protected' &&
                            <input type="password" placeholder="password" {...register("password")} />
                        }
                        <IconPlus onClick={() => handleClick()} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChannelsList() {
    const [channelsList, setChannelsList] = useState<undefined | Channel[]>(undefined);
    let authDatas = useAppSelector((state) => state.auth);
    const sidebarStatus = useContext(SidebarContext);

    useEffect(() => {
        fetchVisibleChannels(authDatas.token, setChannelsList);
    }, [])

    return !channelsList ? (
       <div>
            <LoadingSpin />
       </div>
    ) : (
        <div className="channels-list-wrapper">
            {
                sidebarStatus.sidebar === false &&
                <div className="sidebar-button" onClick={() => sidebarStatus.setSidebarStatus()}>
                    <IconChevronRight />
                </div>
            }
            {
                channelsList.map((elem) => 
                    <ChannelItem  key={elem.id} channelData={elem} token={authDatas.token} />
                )
            }
        </div>   
    )
}

export default ChannelsList;