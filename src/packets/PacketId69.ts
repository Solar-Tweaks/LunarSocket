// 😏

import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId69 extends Packet<Id69> {
  public static id = 69;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id69): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId69.id); // Packet ID

    this.buf.writeString(this.data.id);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      id: this.buf.readString(),
    };
  }
}

interface Id69 {
  id: string;
}
