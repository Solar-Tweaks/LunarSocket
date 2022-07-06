import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class ReceiveFriendRequestPacket extends Packet<ReceiveFriendRequest> {
  public static id = 16;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: ReceiveFriendRequest): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(ReceiveFriendRequestPacket.id); // Packet ID

    this.buf.writeString(data.uuid);
    this.buf.writeString(data.name);
    this.buf.writeBoolean(data.isAdded);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      uuid: this.buf.readString(),
      name: this.buf.readString(),
      isAdded: this.buf.readBoolean(),
    };
  }
}

interface ReceiveFriendRequest {
  uuid: string;
  name: string;
  isAdded: boolean;
}
