import axios from "axios";
import { useEffect, useState } from "react";
import { Channel } from "../../Types/Chat-Types";
import LoadingSpin from "../Utils/Loading-Spin";
import { baseUrl } from "../../env";
import { useAppSelector, useAppDispatch } from "../../Redux/Hooks";
import { IconPlus } from "@tabler/icons";
import { useForm } from "react-hook-form";
import { addChannel } from "../../Redux/ChatSlice"
import { useNavigate } from "react-router-dom";

function ChannelItem(props: {channelData: Channel, token: string}) {
    const { register, handleSubmit, reset, formState: {errors} } = useForm<{password?: string}>();
    const { channelData, token } = props;
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleClick = handleSubmit((data, e) => {
        e?.preventDefault();
        let body: {password?: string};
        if (data.password)
            body = { password: data.password};
        else
            body = {};
        axios.post(`${baseUrl}/channel/${channelData.id}/join`, body, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
        .then((response) => {
            console.log(response);
            dispatch(addChannel({channel: response.data, isActive: 'false'}));
            navigate(`/chat/${response.data.id}`);
        })
        .catch((err) => {
            console.log(err);
        })
    })

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

    useEffect(() => {
        axios.get(`${baseUrl}/channel/visible`, {
            headers: {
                "Authorization": `Bearer ${authDatas.token}`,
            }
        })
        .then((response) => {
            console.log(response);
            setChannelsList([...response.data]);
        })
        .catch((err) => {
            console.log(err);
        })
    }, [])

    return !channelsList ? (
       <div>
            <LoadingSpin />
       </div>
    ) : (
        <div className="channels-list-wrapper">
            {
                channelsList.map((elem) => 
                    <ChannelItem  key={elem.id} channelData={elem} token={authDatas.token} />
                )
            }
        </div>   
    )
}

export default ChannelsList;