import { useEffect, useState, useContext } from "react";
import { Channel, ChannelModesArray, ChannelModes } from "../../Types/Chat-Types";
import LoadingSpin from "../Utils/Loading-Spin";
import { IconPlus, IconChevronRight } from "@tabler/icons";
import { useForm } from "react-hook-form";
import { SidebarContext } from "./Chat";
import { SocketContext } from "../../App";
import { fetchVisibleChannels } from "../../Api/Chat/Chat-Fetch";

function ChannelItem(props: {channelData: Channel}) {
    const { register, handleSubmit, formState: {errors} } = useForm<{password?: string}>();
    const { channelData } = props;
    const {socket} = useContext(SocketContext);

    const handleClick = handleSubmit((data, e) => {
        e?.preventDefault();
        socket?.emit("JoinChannel", {id: channelData.id, password: data.password ? data.password : undefined});
    })

    return (
        <div className="channels-card-wrapper">
            <div className="channel-banner"></div>
            <div className="card-content">
                <p className="channel-name"> { channelData.name } <span>({ ChannelModesArray[channelData.option] })</span> </p>
                <div className="item-bottom">
                    <p> {channelData.channelUsers.length} member(s) </p>
                    <div className="item-bottom-right">
                        {
                            channelData.option === ChannelModes.PROTECTED &&
                            <input 
                                type="password"
                                placeholder="password"
                                maxLength={256}
                                {...register("password", {
                                    minLength: {
                                        value: 5,
                                        message: "Min length is 5"
                                    }
                                })}
                            />
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
    const sidebarStatus = useContext(SidebarContext);

    useEffect(() => {
        fetchVisibleChannels(setChannelsList);
    }, [])

    if (!channelsList) {
        return (
            <div>
                <LoadingSpin />
            </div>
        );
    }

    return channelsList.length > 0 ? (
        <div className="channels-list-wrapper">
            {
                channelsList.map((elem) => 
                    <ChannelItem  key={elem.id} channelData={elem} />
                )
            }
        </div>   
    ) : (
        <>
            {
                sidebarStatus.sidebar === false &&
                <div className="sidebar-button" onClick={() => sidebarStatus.setSidebarStatus()}>
                    <IconChevronRight />
                </div>
            }
            <div className="no-target-message">
                <p> No Visible Channel </p>
            </div>
        </>        
    )
}

export default ChannelsList;