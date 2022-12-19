import { useEffect } from "react";

function BoardGame(props: {hookForm: {watch: any}}) {
    const { hookForm } = props;
    const paddleBackSize = hookForm.watch("paddle_size_back");
    const paddleFrontSize = hookForm.watch("paddle_size_front");
    const playerBackAdvance = hookForm.watch("player_back_advance");
    const playerFrontAdvance = hookForm.watch("player_front_advance");
    
    useEffect(() => {
        const root = document.documentElement;
        root?.style.setProperty(
            "--PaddleBackSize",
            `${paddleBackSize}px`
        );
        root?.style.setProperty(
            "--PaddleFrontSize",
            `${paddleFrontSize}px`
        );

        root?.style.setProperty(
            "--PlayerBackAdvance",
            `${playerBackAdvance * 0.6}px`
        );

        root?.style.setProperty(
            "--PlayerFrontAdvance",
            `${playerFrontAdvance * 0.6}px`
        );
    }, [paddleBackSize, paddleFrontSize, playerBackAdvance, playerFrontAdvance])

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