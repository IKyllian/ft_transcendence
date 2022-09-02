import 'phaser';

export default class Lobby extends Phaser.Scene
{
    constructor ()
    {
        super('lobby');
    }
    preload ()
    {

    }

  //  text_a:any;

	create ()
    {
        // const styles: TextStyle = {
        //     color: '#000000',
        //     align: 'center',
        //     fontSize: 52
        //   }
      
          console.log(this.game.registry.get('allo'));
          this.game.registry.set('atchoum', 'Reddadasdada Gem Stone');


          console.log('in Lobby create');
          console.log('player.name',this.game.registry.get('player').name);
          console.log('player.win', this.game.registry.get('player').win);
          console.log('player.loss', this.game.registry.get('player').loss);
          console.log('player.playertype', this.game.registry.get('player').playertype);       


          //this.text_a.push(this.add.text(0, 0, 'Test', styles).setOrigin(0.5, 0))
          
          console.log


            this.add
              .text(300, 300, 'queue', {
                color: '#000000',
                align: 'center',
                fontSize: '52'
              })
              .setOrigin(0.5, 0)
              .setInteractive()
              .on('pointerdown', () => {
                console.log('cliclic');
                this.scene.start('pong');
              })
   
      
    }
}