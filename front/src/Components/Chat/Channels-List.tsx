import { useEffect, useState, useContext } from "react";
import { Channel, ChannelModesArray, ChannelModes } from "../../Types/Chat-Types";
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
    })

    return (
        <div className="channels-card-wrapper">
            <div className="channel-banner"></div>
            <div className="card-content">
                <p className="channel-name"> { channelData.name } <span>({ ChannelModesArray[channelData.option] })</span> </p>
                <p className="channel-description"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis porta libero, vitae feugiat sem. Aenean porttitor diam non sem congue, vitae euismod diam venenatis. </p>
                <div className="item-bottom">
                    <p> {channelData.channelUsers.length} members </p>
                    <div className="item-bottom-right">
                        {
                            channelData.option === ChannelModes.PROTECTED &&
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
    // const [ joinError, setJoinError] = useState<string | undefined>(undefined);

    let authDatas = useAppSelector((state) => state.auth);
    const sidebarStatus = useContext(SidebarContext);
    const {socket} = useContext(SocketContext);

    useEffect(() => {
        // socket!.on('exception', (data: any) => {
        //     console.log("exception", data);
        //     console.log(data.message);
        //     setJoinError(data.message);
        // });

        fetchVisibleChannels(authDatas.token, setChannelsList);

        // return () => {
        //     socket?.off('exception');
        // }
    }, [])

    // useEffect(() => {
       

       
    // }, [])

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