
var text;
var timedEvent;

var game = new Phaser.Game(config);

function create ()
{
    console.log('create');
    // 2:30 in seconds
    this.initialTime = 150;

    text = this.add.text(32, 32, 'Countdown: ' + formatTime(this.initialTime));

    // Each 1000 ms call onEvent
    timedEvent = this.time.addEvent({ delay: 1000, callback: onEvent, callbackScope: this, loop: true });
}

function formatTime(seconds){
    // Minutes
    var minutes = Math.floor(seconds/60);
    // Seconds
    var partInSeconds = seconds%60;
    // Adds left zeros to seconds
    partInSeconds = partInSeconds.toString().padStart(2,'0');
    // Returns formated time
    return `${minutes}:${partInSeconds}`;
}


function onEvent ()
{
    this.initialTime -= 1; // One second
    text.setText('Countdown: ' + formatTime(this.initialTime));
}