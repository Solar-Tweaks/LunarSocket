import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId55 extends Packet<Id55> {
  public static id = 55;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id55): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId55.id); // Packet ID

    this.buf.finish();
  }

  public read(): void {
    this.data = {};
  }
}

interface Id55 {}
