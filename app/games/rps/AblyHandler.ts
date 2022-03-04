import { Realtime, Types } from 'ably/promises';
import { Player } from './Player';

export class AblyHandler {
    private player: Player;
    private gameId: string;
    
    private connection: any;
    private stateChannel: any;
    private shouldChangeColor: boolean;

    constructor(player: Player, gameId: string) {
        this.player = player;
        this.gameId = gameId;

        this.connection = new Realtime.Promise({authUrl: '/api/ably-token-request' });
        /*plugins: {
            vcdiff: vcdiffDecoder
        }*/

        this.stateChannel = this.connection.channels.get('states:' + gameId /*, { params: { delta: 'vcdiff' } }*/);
        this.shouldChangeColor = false;

        this.stateChannel.subscribe('update-colors', (msg) => {
            this.shouldChangeColor = true;
        });

        this.stateChannel.subscribe(player.id, (msg) => {
            player.alive = false;
            this.updateState(player);

            setTimeout(() => {
                player.respawn(); 
            }, 3000);
        });

        this.joinState(this.copyWithoutMap(player));
    }

    public sendMessage(name, message) {
        this.stateChannel.publish(name, message);
    }

    public changeColors() {
        this.stateChannel.publish('update-colors', null);
    }

    public joinState(player) {
        this.stateChannel.presence.enter(this.copyWithoutMap(player));
    }

    public updateState(player) {
        this.stateChannel.presence.update(this.copyWithoutMap(player));
    }

    public async getState(playerName) {
        return await this.stateChannel.presence.get({ clientId: playerName});
    }

    public async playerPositions() {
        return await this.stateChannel.presence.get();
    }
    
    private copyWithoutMap(player) {
        var newPlayer = {
            'id' : player.id,
            'x' : player.x,
            'y' : player.y,
            'width' : player.width,
            'height' : player.height,
            'name' : player.name,
            'color' : player.color,
            'alive': player.alive,
            'score': player.score
        }
        return newPlayer;
    }    
}
