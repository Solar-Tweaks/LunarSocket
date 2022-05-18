import { readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const configPath = join(process.cwd(), 'config.json');

export default async function getConfig(): Promise<Config> {
  return JSON.parse(await readFile(configPath, 'utf-8'));
}

export function getConfigSync(): Config {
  return JSON.parse(readFileSync(configPath, 'utf-8'));
}

export async function editConfig(newConfig: Config): Promise<void> {
  await writeFile(configPath, JSON.stringify(newConfig, null, 2));
}

const defaultConfig = {
    port: 80,
    secure: false,
    certificates: {
      key: '',
      cert: '',
    },
  whitelist: {
    enabled: false,
    list: [] as string[],
  },
  welcomeMessage: 'LunarSocket made by Cy0ze with love <3',
  operators: [] as string[],
  database: {
    type: 'instanceStorage' as 'instanceStorage' | 'mongo',
    config: {
      mongo: 'mongodb://<password>@localhost:27017',
    },
  },
};

type Config = typeof defaultConfig;
