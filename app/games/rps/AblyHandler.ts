import { Realtime, Types } from 'ably';
import { Player } from './Player';

export class AblyHandler {

    public get connectionState() {
        return this.connection.connection.state;
    }

    private connection: Types.RealtimePromise;
    private stateChannel: Types.RealtimeChannelPromise;

    constructor() {
    }

    public async connect(player: Player, gameId: string) {
        this.connection = new Realtime.Promise({ authUrl: '/api/ably-token-request' });
        this.stateChannel = this.connection.channels.get('states:' + gameId);

        this.stateChannel.subscribe(player.id, (msg: Types.Message) => {
            player.alive = false;
            this.updateState(player);

            setTimeout(() => {
                player.respawn();
            }, 3000);
        });

        this.stateChannel.presence.enter(this.toPlayerMetadata(player));
    }

    public async disconnect() {
        await this.connection.close();
    }

    public killPlayer(playerId: string) {
        this.stateChannel.publish(playerId, 'kill' as any);
    }

    public updateState(player: Player) {
        this.stateChannel.presence.update(this.toPlayerMetadata(player));
    }

    public async playerMetadata() {
        return await this.stateChannel.presence.get();
    }

    public async getMap(gameId: string) {
        const stateChannel = this.connection.channels.get("control-messages:" + gameId);
        const history = await stateChannel.history();
        const historyMessage = history.items[0];
        const previousStateData = historyMessage?.data || [];
        
        if (!previousStateData || previousStateData === undefined) {
        console.log("Oh no! Map lost! Not updating.", history);
        return;
        }
        
        return previousStateData.seed;
    }

    private toPlayerMetadata(player: Player) {
        return {
            'id': player.id,
            'x': player.x,
            'y': player.y,
            'width': player.width,
            'height': player.height,
            'name': player.name,
            'color': player.color,
            'alive': player.alive,
            'score': player.score,
            'spectator': player.spectator
        };
    }
}
