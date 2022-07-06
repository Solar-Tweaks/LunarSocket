import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class UpdateVisiblePlayersPacket extends Packet<UpdateVisiblePlayers> {
  public static id = 50;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: UpdateVisiblePlayers): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(UpdateVisiblePlayersPacket.id); // Packet ID

    this.buf.writeVarInt(data.players.length);
    for (const uuid of data.players) {
      this.buf.writeUUID(uuid);
    }

    this.buf.finish();
  }

  public read(): void {
    const playersLength = this.buf.readVarInt();
    const players: string[] = [];
    for (let i = 0; i < playersLength; i++) {
      players.push(this.buf.readUUID());
    }

    this.data = {
      players,
    };
  }
}

interface UpdateVisiblePlayers {
  players: string[];
}
