import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId71 extends Packet<Id71> {
  public static id = 71;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id71): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId71.id); // Packet ID

    this.buf.writeString(this.data.unknownStringA);
    this.buf.writeString(this.data.unknownStringB);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      unknownStringA: this.buf.readString(),
      unknownStringB: this.buf.readString(),
    };
  }
}

interface Id71 {
  unknownStringA: string;
  unknownStringB: string;
}
