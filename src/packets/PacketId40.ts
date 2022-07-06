import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId40 extends Packet<Id40> {
  public static id = 40;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id40): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId40.id); // Packet ID

    this.buf.writeBoolean(this.data.unknownBoolean);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      unknownBoolean: this.buf.readBoolean(),
    };
  }
}

interface Id40 {
  unknownBoolean: boolean;
}
