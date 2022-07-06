import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId25 extends Packet<Id25> {
  public static id = 25;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id25): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId25.id); // Packet ID

    this.buf.writeShort(data.data.length);
    this.buf.writeBytes(data.data);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      data: Array.from(this.buf.readBytes(this.buf.readShort())),
    };
  }
}

interface Id25 {
  data: number[];
}
