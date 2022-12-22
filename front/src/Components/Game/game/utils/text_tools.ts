import 'phaser';

export function shorten_nickname(nick: string) :string
{
    if (nick.length >= 9)
    {
       return nick.substring(0, 7) + "...";
    }
    return nick;
}

export function make_style(size: number, color: string = '#E0E1DD'): Phaser.Types.GameObjects.Text.TextStyle
{
    let ret: Phaser.Types.GameObjects.Text.TextStyle = 
    {
        fontSize: "" + size + "px",
        color: color,
        fontFamily: 'Silkscreen'
    }

    return ret;
}