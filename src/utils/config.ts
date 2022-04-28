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

interface Config {
  port: number;
  secure: boolean;
  certificates?: {
    key: string;
    cert: string;
  };
  welcomeMessage: '';
  enableWhitelist: boolean;
  whitelist: string[];
  operators: string[];
  iconColor: number;
  plusColor: number;
  operatorIconColor: number;
  operatorPlusColor: number;
}
