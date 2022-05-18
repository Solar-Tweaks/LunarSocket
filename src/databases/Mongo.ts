import { Collection, MongoClient } from 'mongodb';
import Player, { DatabasePlayer } from '../player/Player';
import getConfig from '../utils/config';
import logger from '../utils/logger';
import Database from './Database';

export default class Mongo extends Database {
  private client: MongoClient;
  private collection: Collection;

  public constructor() {
    super();
    this.init();
  }

  private async init(): Promise<void> {
    const config = await getConfig();

    this.client = new MongoClient(config.databaseConfig.mongo);
    await this.client.connect();
    logger.log('Connected to MongoDB');

    const db = this.client.db('LunarSocket');
    this.collection = db.collection('players');
  }

  public async setPlayer(player: Player): Promise<void> {
    const existingPlayer = await this.getPlayer(player.uuid);

    if (existingPlayer)
      this.collection.updateOne(
        { uuid: player.uuid },
        { $set: player.getDatabasePlayer() }
      );
    else
      await this.collection.insertOne({
        // Mango specific data, used to get the player
        uuid: player.uuid,
        ...player.getDatabasePlayer(),
      });
  }

  public async getPlayer(uuid: string): Promise<DatabasePlayer> {
    const player = await this.collection.findOne<DatabasePlayer>({ uuid });
    return player;
  }
}
