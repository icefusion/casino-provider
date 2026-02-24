/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as dte from 'dotenv';
import { DataSource } from 'typeorm';
import * as path from 'path';

dte.config({ path: './.env.casino' });

console.log('[DATA-SOURCE] carregando data source...');

function isTsRuntime(): boolean {
  return __filename.endsWith('.ts');
}

function entitiesGlobs(): string[] {
  const ext = isTsRuntime() ? 'ts' : 'js';

  return isTsRuntime()
    ? [
        path.resolve(
          process.cwd(),
          'apps',
          '*',
          'src',
          'domains',
          '**',
          'entities',
          `*.entity.${ext}`,
        ),
      ]
    : [
        path.resolve(
          process.cwd(),
          'dist',
          'apps',
          '*',
          'domains',
          '**',
          'entities',
          `*.entity.${ext}`,
        ),
      ];
}

function migrationsGlobs(): string[] {
  const ext = isTsRuntime() ? 'ts' : 'js';
  return [path.resolve(process.cwd(), 'migrations', `*.${ext}`)];
}

function makeDataSourceOptionsFromUrl() {
  const url = process.env.DATABASE_URL ?? ' ';

  console.log(
    '[DATA-SOURCE] DATABASE_URL detectada, gerando opções a partir dela.',
  );
  console.log('URL:', url);

  const u = new URL(url);

  const sslMode = u.searchParams.get('sslmode') || '';
  const loggingOn =
    (process.env.DB_LOGGING ?? 'false').toLowerCase() === 'true';

  const sslOn =
    (process.env.DB_SSL ?? '').toLowerCase() === 'true' ||
    ['require', 'prefer', 'verify-ca', 'verify-full'].includes(sslMode);

  return {
    type: 'postgres' as const,
    host: u.hostname,
    port: Number(u.port || 5432),
    username: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
    entities: entitiesGlobs(),
    migrations: migrationsGlobs(),
    logging: loggingOn,
    synchronize: false,
    ssl: sslOn ? { rejectUnauthorized: false } : false,
  };
}

function makeDataSourceOptionsFromEnv() {
  const loggingOn =
    (process.env.DB_LOGGING ?? 'false').toLowerCase() === 'true';
  const sslOn = (process.env.DB_SSL ?? 'false').toLowerCase() === 'true';

  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'postgres',
    entities: entitiesGlobs(),
    migrations: migrationsGlobs(),
    logging: loggingOn,
    synchronize: false,
    ssl: sslOn ? { rejectUnauthorized: false } : false,
  };
}

const sshEnabled =
  (process.env.DB_SSH_ENABLE ?? 'false').toLowerCase() === 'true';

const options =
  process.env.DATABASE_URL && !sshEnabled
    ? makeDataSourceOptionsFromUrl()
    : makeDataSourceOptionsFromEnv();

console.log('[DATA-SOURCE] options geradas:', {
  type: options.type,
  host: (options as any).host,
  port: (options as any).port,
  database: (options as any).database,
  ssl: (options as any).ssl,
});

export const AppDataSource = new DataSource(options);
export default AppDataSource;
