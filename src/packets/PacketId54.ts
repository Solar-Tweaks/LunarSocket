import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId54 extends Packet<Id54> {
  public static id = 54;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id54): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId54.id); // Packet ID

    this.buf.writeInt(data.unknownCollectionA.length);
    for (const i of data.unknownCollectionA) this.buf.writeLong(i);

    this.buf.writeInt(data.unknownCollectionB.length);
    for (const i of data.unknownCollectionB) this.buf.writeLong(i);

    this.buf.finish();
  }

  public read(): void {
    const unknownCollectionALength = this.buf.readInt();
    const unknownCollectionA: number[] = [];
    for (let i = 0; i < unknownCollectionALength; i++)
      unknownCollectionA.push(this.buf.readLong() as number);

    const unknownCollectionBLength = this.buf.readInt();
    const unknownCollectionB: number[] = [];
    for (let i = 0; i < unknownCollectionBLength; i++)
      unknownCollectionB.push(this.buf.readLong() as number);

    this.data = {
      unknownCollectionA,
      unknownCollectionB,
    };
  }
}

interface Id54 {
  unknownCollectionA: number[];
  unknownCollectionB: number[];
}
