import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class ToggleFriendRequestsPacket extends Packet<ToggleFriendRequests> {
  public static id = 22;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: ToggleFriendRequests): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(ToggleFriendRequestsPacket.id); // Packet ID

    this.buf.writeBoolean(data.status);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      status: this.buf.readBoolean(),
    };
  }
}

interface ToggleFriendRequests {
  status: boolean;
}
