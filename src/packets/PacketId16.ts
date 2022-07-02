import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId16 extends Packet<Id16> {
  public static id = 16;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id16): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId16.id); // Packet ID

    this.buf.writeString(data.uuid);
    this.buf.writeString(data.name);
    this.buf.writeBoolean(data.unknownBoolean);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      uuid: this.buf.readString(),
      name: this.buf.readString(),
      unknownBoolean: this.buf.readBoolean(),
    };
  }
}

interface Id16 {
  uuid: string;
  name: string;
  unknownBoolean: boolean;
}
