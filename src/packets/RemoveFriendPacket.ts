import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class RemoveFriendPacket extends Packet<RemoveFriend> {
  public static id = 17;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: RemoveFriend): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(RemoveFriendPacket.id); // Packet ID

    this.buf.writeString(data.uuid);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      uuid: this.buf.readString(),
    };
  }
}

interface RemoveFriend {
  uuid: string;
}
