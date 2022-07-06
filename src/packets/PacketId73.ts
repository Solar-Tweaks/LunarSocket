import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId73 extends Packet<Id73> {
  public static id = 73;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id73): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId73.id); // Packet ID

    this.buf.writeVarInt(data.unknownList.length);
    for (const i of data.unknownList) this.buf.writeInt(i);

    this.buf.finish();
  }

  public read(): void {
    const unknownListLength = this.buf.readVarInt();
    const unknownList: number[] = [];
    for (let i = 0; i < unknownListLength; i++)
      unknownList.push(this.buf.readInt());

    this.data = {
      unknownList,
    };
  }
}

interface Id73 {
  unknownList: number[];
}
