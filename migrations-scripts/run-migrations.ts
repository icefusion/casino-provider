import 'dotenv/config';
import 'reflect-metadata';
import AppDataSource from './data-source';

async function main() {
  console.log('[MIGRATIONS] iniciando...');

  try {
    console.log('[MIGRATIONS] inicializando DataSource...');
    const dataSource = await AppDataSource.initialize();
    console.log(
      '[MIGRATIONS] DataSource inicializado, executando migrations...',
    );

    const results = await dataSource.runMigrations();
    console.log('[MIGRATIONS] migrations executadas:');
    for (const m of results) {
      console.log(` - ${m.name}`);
    }

    console.log('[MIGRATIONS] finalizando conexão...');
    await dataSource.destroy();
    console.log('[MIGRATIONS] concluído com sucesso.');
  } catch (err) {
    console.error('[MIGRATIONS] erro ao executar migrations:');
    console.error(err);
    process.exit(1);
  }
}

main();
