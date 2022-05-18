import getConfig from '../utils/config';
import logger from '../utils/logger';
import InstanceStorage from './InstanceStorage';
import Mongo from './Mongo';

class DatabaseManager {
  public database: InstanceStorage | Mongo;

  public static instance = new DatabaseManager();

  private constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const config = await getConfig();

    logger.log('Using database:', config.database);

    const constructors = {
      instanceStorage: InstanceStorage,
      mongo: Mongo,
    };

    this.database = new constructors[config.database]();
  }
}

export default DatabaseManager.instance;
