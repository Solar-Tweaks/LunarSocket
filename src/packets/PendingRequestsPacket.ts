import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PendingRequestsPacket extends Packet<PendingRequests> {
  public static id = 7;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: PendingRequests): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PendingRequestsPacket.id); // Packet ID

    this.buf.writeString(JSON.stringify({ bulk: data.bulk }));

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      bulk: JSON.parse(this.buf.readString()).bulk,
    };
  }
}

interface PendingRequests {
  bulk: {
    name: string;
    uuid: string;
  }[];
}
