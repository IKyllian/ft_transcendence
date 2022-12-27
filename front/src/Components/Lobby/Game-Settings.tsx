import { IconLock } from "@tabler/icons";
import { GameSettings} from "../../Types/Lobby-Types";
import { Controller, UseFormGetValues } from "react-hook-form";

interface Props {
    hookForm: {
        handleSubmit: any,
        control: any,
        watch: any,
        getValues: UseFormGetValues<GameSettings>
    },
    onInputChange: Function,
    loggedUserIsLeader:boolean,
}

function GameSettingsWrapper(props: Props) {
    const { hookForm, onInputChange, loggedUserIsLeader } = props;

    return (
        <div className="setting-wrapper game-settings">            
            <p> Settings </p>
            { !loggedUserIsLeader && <IconLock className="lock-icon" /> }
            {
                loggedUserIsLeader && 
                <form onSubmit={(e) => hookForm.handleSubmit(e)}>
                    <Controller
                        control={hookForm.control}
                        name="paddle_size_back"
                        defaultValue={hookForm.getValues("paddle_size_back")}
                        render={({ field: { value }}) => (
                            <label>
                                Paddle Back Size
                                <input disabled={!loggedUserIsLeader} type="range" min={10} max={200} onChange={(e) => onInputChange(e, "paddle_size_back")} value={value} />
                                <div className="input-value"> {value} </div>
                            </label>
                            
                        )}
                    />
                     <Controller
                        control={hookForm.control}
                        name="paddle_size_front"
                        defaultValue={hookForm.getValues("paddle_size_front")}
                        render={({ field: { value }}) => (
                            <label>
                                Paddle Front Size
                                <input disabled={!loggedUserIsLeader} type="range" min={10} max={200} onChange={(e) => onInputChange(e, "paddle_size_front")} value={value} />
                                <div className="input-value"> {value} </div>
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="player_back_advance"
                        defaultValue={hookForm.getValues().player_back_advance}
                        render={({ field: { value }}) => (
                            <label>
                                Player Back Advance
                                <input disabled={!loggedUserIsLeader} type="range" min={10} max={180} onChange={(e) => onInputChange(e, "player_back_advance")} value={value} />
                                <div className="input-value"> {value} </div>
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="player_front_advance"
                        defaultValue={hookForm.getValues("player_front_advance")}
                        render={({ field: { value }}) => (
                            <label>
                                Player Front Advance
                                <input disabled={!loggedUserIsLeader} type="range" min={60} max={350} onChange={(e) => onInputChange(e, "player_front_advance")} value={value} />
                                <div className="input-value"> {value} </div>
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="paddle_speed"
                        defaultValue={hookForm.getValues("paddle_speed")}
                        render={({ field: { value }}) => (
                            <label>
                                Paddle Speed
                                <input disabled={!loggedUserIsLeader} type="range" min={5} max={25} onChange={(e) => onInputChange(e, "paddle_speed")} value={value} />
                                <div className="input-value"> {value} </div>
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="ball_start_speed"
                        defaultValue={hookForm.getValues("ball_start_speed")}
                        render={({ field: { value }}) => (
                            <label>
                                Ball Start Speed
                                <input disabled={!loggedUserIsLeader} type="range" min={5} max={10} onChange={(e) => onInputChange(e, "ball_start_speed")} value={value} />
                                <div className="input-value"> {value} </div>
                            </label>
                            
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="ball_acceleration"
                        defaultValue={hookForm.getValues("ball_acceleration")}
                        render={({ field: { value }}) => (
                            <label>
                                Ball Acceleration
                                <input disabled={!loggedUserIsLeader} step="0.5" type="range" min={0.5} max={3} onChange={(e) => onInputChange(e, "ball_acceleration")} value={value} />
                                <div className="input-value"> {value} </div>
                            </label>
                        )}
                    />
                    <Controller
                        control={hookForm.control}
                        name="point_for_victory"
                        defaultValue={hookForm.getValues("point_for_victory")}
                        render={({ field: { value }}) => (
                            <label>
                                Point For Victory
                                <input disabled={!loggedUserIsLeader} type="range" min={1} max={10} onChange={(e) => onInputChange(e, "point_for_victory")} value={value} />
                                <div className="input-value"> {value} </div>
                            </label>
                            
                        )}
                    />
                    <button className="setting-submit" type="submit"> Submit </button>
                </form>
            }
        </div>
    );
}

export default GameSettingsWrapper;