import * as fs from 'fs';
import * as path from 'path';

function toPascalCase(str: string): string {
  return str
    .replace(/[-_]+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
}

function main() {
  const [, , nameArg] = process.argv;

  if (!nameArg) {
    console.error('Uso: ts-node src/create-migration.ts <nome-da-migration>');
    process.exit(1);
  }

  const timestamp = Date.now();
  const classBaseName = toPascalCase(nameArg);
  const className = `${classBaseName}${timestamp}`;
  const fileName = `${timestamp}${classBaseName}.ts`;

  const migrationsDir = path.resolve(process.cwd(), 'migrations');
  const filePath = path.join(migrationsDir, fileName);

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const template = `import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${className} implements MigrationInterface {
  name = '${className}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // TODO: implementar
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // TODO: reverter o que foi feito no up
  }
}
`;

  fs.writeFileSync(filePath, template, { encoding: 'utf8' });

  console.log('[MIGRATIONS:CREATE] migration criada:');
  console.log(` - Arquivo: ${filePath}`);
  console.log(` - Classe:  ${className}`);
}

try {
  main();
} catch (err) {
  console.error('[MIGRATIONS:CREATE] erro ao criar migration:', err);
  process.exit(1);
}
