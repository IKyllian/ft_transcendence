import { useEffect } from "react";

function BoardGame(props: {hookForm: {watch: any}}) {
    const { hookForm } = props;
    const paddleSize = hookForm.watch("paddle_size_h");
    const playerBackAdvance = hookForm.watch("player_back_advance");
    const playerFrontAdvance = hookForm.watch("player_front_advance");
    
    useEffect(() => {
        const root = document.documentElement;
        root?.style.setProperty(
            "--PaddleHeight",
            `${paddleSize}px`
        );

        root?.style.setProperty(
            "--PlayerBackAdvance",
            `${playerBackAdvance}px`
        );

        root?.style.setProperty(
            "--PlayerFrontAdvance",
            `${playerFrontAdvance}px`
        );
    }, [paddleSize, playerBackAdvance, playerFrontAdvance])

    return (
        <div className="setting-wrapper board-game-wrapper">
            <div className="game-board">
                <div className="paddle-wrapper left-wrapper">
                    <div className="paddle paddle-left paddle-back"> </div>
                    <div className="paddle paddle-left paddle-front"> </div>
                </div>
                <div className="ball"> </div>
                <div className="paddle-wrapper right-wrapper">
                    <div className="paddle paddle-right paddle-back"> </div>
                    <div className="paddle paddle-right paddle-front"> </div>
                </div>
            </div>
        </div>
    );
}

export default BoardGame;