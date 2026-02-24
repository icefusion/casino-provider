import 'dotenv/config';
import 'reflect-metadata';
import AppDataSource from './data-source';

async function main() {
  console.log('[MIGRATIONS:REVERT] iniciando...');

  try {
    console.log('[MIGRATIONS:REVERT] inicializando DataSource...');
    const dataSource = await AppDataSource.initialize();
    console.log(
      '[MIGRATIONS:REVERT] DataSource inicializado, revertendo última migration...',
    );

    await dataSource.undoLastMigration();

    console.log(
      '[MIGRATIONS:REVERT] última migration revertida (se havia alguma aplicada).',
    );

    console.log('[MIGRATIONS:REVERT] finalizando conexão...');
    await dataSource.destroy();
    console.log('[MIGRATIONS:REVERT] concluído.');
  } catch (err) {
    console.error('[MIGRATIONS:REVERT] erro ao reverter migration:', err);
    process.exit(1);
  }
}

main();
