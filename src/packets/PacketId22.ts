import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId22 extends Packet<Id22> {
  public static id = 22;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id22): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId22.id); // Packet ID

    this.buf.writeBoolean(data.unknownBoolean);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      unknownBoolean: this.buf.readBoolean(),
    };
  }
}

interface Id22 {
  unknownBoolean: boolean;
}
