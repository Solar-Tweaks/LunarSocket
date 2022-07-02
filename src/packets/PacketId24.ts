import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId24 extends Packet<Id24> {
  public static id = 24;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id24): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId24.id); // Packet ID

    this.buf.writeInt(data.id);
    this.buf.writeString(data.value);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      id: this.buf.readInt(),
      value: this.buf.readString(),
    };
  }
}

interface Id24 {
  id: number;
  value: string;
}
