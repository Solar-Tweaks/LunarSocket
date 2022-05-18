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
    key: "/path/to/key.key",
    cert: "/path/to/cert.crt"
  },
  welcomeMessage: "Welcome!",
  enableWhitelist: true,
  whitelist: [
    "827f8c48-cdb2-4105-af39-df5a64f93490",
    "7642d15d-2aec-4be8-8cbe-99a53c434248"
  ],
  operators: ["827f8c48-cdb2-4105-af39-df5a64f93490"],
  database: "instanceStorage",
  databaseConfig: {
    mongo: "mongo+srv://..."
  }
};

type Config = typeof defaultConfig;
