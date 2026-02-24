/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'dotenv/config';
import 'reflect-metadata';
import { createId } from '@paralleldrive/cuid2';
import AppDataSource from './data-source';

type SeedConfig = {
  providerCode: string;
  providerName: string;
  providerBaseUrl: string;
  providerSecret: string;
  casinoUsername: string;
  currency: string;
  initialBalance: string;
  casinoGameCode: string;
  casinoGameName: string;
  providerGameCode: string;
  providerGameName: string;
};

function cfg(): SeedConfig {
  return {
    providerCode: process.env.SEED_PROVIDER_CODE ?? 'ACME_PROVIDER',
    providerName: process.env.SEED_PROVIDER_NAME ?? 'Acme Provider',
    providerBaseUrl:
      process.env.SEED_PROVIDER_BASE_URL ?? 'http://localhost:3002',
    providerSecret:
      process.env.SEED_PROVIDER_SECRET ??
      '605a942fe159421b679c262957645c80dcdd21c9f9486075a4d079757078bd79',

    casinoUsername: process.env.SEED_CASINO_USERNAME ?? 'will@casino.local',
    currency: process.env.SEED_CURRENCY ?? 'BRL',
    initialBalance: process.env.SEED_INITIAL_BALANCE ?? '100000',

    casinoGameCode: process.env.SEED_CASINO_GAME_CODE ?? 'SLOTS_1',
    casinoGameName: process.env.SEED_CASINO_GAME_NAME ?? 'Slots Demo',

    providerGameCode: process.env.SEED_PROVIDER_GAME_CODE ?? 'SLOTS_1',
    providerGameName: process.env.SEED_PROVIDER_GAME_NAME ?? 'Slots Demo',
  };
}

async function main() {
  const c = cfg();
  console.log('[SEED] iniciando...');

  const ds = await AppDataSource.initialize();
  console.log('[SEED] DataSource inicializado.');

  try {
    const casinoProviderId = createId();

    await ds.query(
      `
      INSERT INTO "CASINO_GAME_PROVIDERS"
        ("id", "code", "name", "base_url", "provider_secret", "active", "created_at")
      VALUES
        ($1, $2, $3, $4, $5, true, now())
      ON CONFLICT ("code") DO NOTHING
      `,
      [
        casinoProviderId,
        c.providerCode,
        c.providerName,
        c.providerBaseUrl,
        c.providerSecret,
      ],
    );

    const casinoProviderRow = await ds.query(
      `SELECT "id" FROM "CASINO_GAME_PROVIDERS" WHERE "code" = $1 LIMIT 1`,
      [c.providerCode],
    );
    const casinoProviderIdFinal: string = casinoProviderRow[0]?.id;
    if (!casinoProviderIdFinal)
      throw new Error('Fail to Create / Get CASINO_GAME_PROVIDERS');

    console.log('[SEED] CASINO_GAME_PROVIDERS ok:', casinoProviderIdFinal);

    const casinoGameId = createId();

    await ds.query(
      `
      INSERT INTO "CASINO_GAMES"
        ("id", "provider_id", "code", "name", "active", "created_at")
      VALUES
        ($1, $2, $3, $4, true, now())
      ON CONFLICT ("code") DO NOTHING
      `,
      [casinoGameId, casinoProviderIdFinal, c.casinoGameCode, c.casinoGameName],
    );

    const casinoGameRow = await ds.query(
      `SELECT "id" FROM "CASINO_GAMES" WHERE "code" = $1 LIMIT 1`,
      [c.casinoGameCode],
    );
    const casinoGameIdFinal: string = casinoGameRow[0]?.id;
    if (!casinoGameIdFinal)
      throw new Error('Fail to Create / Get CASINO_GAMES');

    console.log('[SEED] CASINO_GAMES ok:', casinoGameIdFinal);

    const casinoUserId = createId();

    await ds.query(
      `
      INSERT INTO "CASINO_USERS"
        ("id", "username", "created_at")
      VALUES
        ($1, $2, now())
      ON CONFLICT ("username") DO NOTHING
      `,
      [casinoUserId, c.casinoUsername],
    );

    const casinoUserRow = await ds.query(
      `SELECT "id" FROM "CASINO_USERS" WHERE "username" = $1 LIMIT 1`,
      [c.casinoUsername],
    );
    const casinoUserIdFinal: string = casinoUserRow[0]?.id;
    if (!casinoUserIdFinal)
      throw new Error('Fail to Create / Get CASINO_USERS');

    console.log('[SEED] CASINO_USERS ok:', casinoUserIdFinal);

    const existingWallet = await ds.query(
      `SELECT "id" FROM "CASINO_WALLETS" WHERE "user_id" = $1 LIMIT 1`,
      [casinoUserIdFinal],
    );

    if (existingWallet.length === 0) {
      const walletId = createId();
      await ds.query(
        `
        INSERT INTO "CASINO_WALLETS"
          ("id", "user_id", "balance", "currency", "updated_at")
        VALUES
          ($1, $2, $3, $4, now())
        `,
        [walletId, casinoUserIdFinal, c.initialBalance, c.currency],
      );
      console.log('[SEED] CASINO_WALLETS criado:', walletId);
    } else {
      console.log('[SEED] CASINO_WALLETS já existe:', existingWallet[0].id);
    }

    const providerGameId = createId();

    await ds.query(
      `
      INSERT INTO "PROVIDER_GAMES"
        ("id", "code", "name", "active", "created_at")
      VALUES
        ($1, $2, $3, true, now())
      ON CONFLICT ("code") DO NOTHING
      `,
      [providerGameId, c.providerGameCode, c.providerGameName],
    );

    const providerGameRow = await ds.query(
      `SELECT "id" FROM "PROVIDER_GAMES" WHERE "code" = $1 LIMIT 1`,
      [c.providerGameCode],
    );
    const providerGameIdFinal: string = providerGameRow[0]?.id;
    if (!providerGameIdFinal)
      throw new Error('Fail to Create / Get PROVIDER_GAMES');

    console.log('[SEED] PROVIDER_GAMES ok:', providerGameIdFinal);

    const providerCustomerId = createId();

    await ds.query(
      `
      INSERT INTO "PROVIDER_CUSTOMERS"
        ("id", "casino_user_id", "display_name", "created_at")
      VALUES
        ($1, $2, $3, now())
      ON CONFLICT ("casino_user_id") DO NOTHING
      `,
      [providerCustomerId, casinoUserIdFinal, c.casinoUsername],
    );

    const providerCustomerRow = await ds.query(
      `SELECT "id" FROM "PROVIDER_CUSTOMERS" WHERE "casino_user_id" = $1 LIMIT 1`,
      [casinoUserIdFinal],
    );
    const providerCustomerIdFinal: string = providerCustomerRow[0]?.id;
    if (!providerCustomerIdFinal)
      throw new Error('Fail to Create / Get PROVIDER_CUSTOMERS');

    console.log('[SEED] PROVIDER_CUSTOMERS ok:', providerCustomerIdFinal);

    console.log('[SEED] concluído com sucesso ✅');
    console.log('[SEED] resumo:');
    console.log('  - casino user:', c.casinoUsername, casinoUserIdFinal);
    console.log('  - casino game:', c.casinoGameCode, casinoGameIdFinal);
    console.log('  - provider:', c.providerCode, casinoProviderIdFinal);
  } catch (err) {
    console.error('[SEED] erro:', err);
    process.exitCode = 1;
  } finally {
    await ds.destroy();
    console.log('[SEED] conexão finalizada.');
  }
}

main();
