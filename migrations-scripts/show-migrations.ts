import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import AppDataSource from './data-source';

type DataSourceWithShow = DataSource & {
  showMigrations(): Promise<void>;
};

async function main() {
  console.log('[MIGRATIONS:SHOW] iniciando...');

  try {
    console.log('[MIGRATIONS:SHOW] inicializando DataSource...');
    const dataSource = await AppDataSource.initialize();
    console.log(
      '[MIGRATIONS:SHOW] DataSource inicializado, mostrando migrations...',
    );

    if ('showMigrations' in dataSource) {
      const dsWithShow = dataSource as DataSourceWithShow;
      await dsWithShow.showMigrations();
    } else {
      console.log(
        '[MIGRATIONS:SHOW] showMigrations() não está disponível nesta versão do TypeORM.',
      );
    }

    console.log('[MIGRATIONS:SHOW] lista local de migrations registradas:');
    for (const m of dataSource.migrations) {
      console.log(` - ${m.name}`);
    }

    console.log('[MIGRATIONS:SHOW] finalizando conexão...');
    await dataSource.destroy();
    console.log('[MIGRATIONS:SHOW] concluído.');
  } catch (err) {
    console.error('[MIGRATIONS:SHOW] erro ao listar migrations:', err);
    process.exit(1);
  }
}

main();
