import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1771800030463 implements MigrationInterface {
  name = 'InitialMigration1771800030463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "casino_transactions_type_enum" AS ENUM ('DEBIT', 'CREDIT', 'ROLLBACK')
    `);

    await queryRunner.query(`
      CREATE TYPE "provider_game_rounds_status_enum" AS ENUM ('OPEN', 'CLOSED')
    `);

    await queryRunner.query(`
      CREATE TYPE "provider_bets_type_enum" AS ENUM ('BET', 'WIN', 'ROLLBACK')
    `);

    await queryRunner.query(`
      CREATE TABLE "CASINO_USERS" (
        "id" varchar(40) NOT NULL,
        "username" varchar(120) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_CASINO_USERS_ID" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_CASINO_USERS_USERNAME" UNIQUE ("username")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "CASINO_WALLETS" (
        "id" varchar(40) NOT NULL,
        "user_id" varchar(40) NOT NULL,
        "balance" bigint NOT NULL DEFAULT 0,
        "currency" varchar(8) NOT NULL DEFAULT 'BRL',
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_CASINO_WALLETS_ID" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_CASINO_WALLETS_USER_ID" ON "CASINO_WALLETS" ("user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "CASINO_GAME_PROVIDERS" (
        "id" varchar(40) NOT NULL,
        "code" varchar(80) NOT NULL,
        "name" varchar(200) NOT NULL,
        "base_url" varchar(300) NOT NULL,
        "provider_secret" varchar(200) NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_CASINO_GAME_PROVIDERS_ID" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_CASINO_GAME_PROVIDERS_CODE" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "CASINO_GAMES" (
        "id" varchar(40) NOT NULL,
        "provider_id" varchar(40) NOT NULL,
        "code" varchar(80) NOT NULL,
        "name" varchar(200) NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_CASINO_GAMES_ID" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_CASINO_GAMES_CODE" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_CASINO_GAMES_PROVIDER_ID" ON "CASINO_GAMES" ("provider_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "CASINO_GAME_SESSIONS" (
        "id" varchar(40) NOT NULL,
        "user_id" varchar(40) NOT NULL,
        "wallet_id" varchar(40) NOT NULL,
        "provider_id" varchar(40) NOT NULL,
        "game_id" varchar(40) NOT NULL,
        "casino_session_token" varchar(80) NOT NULL,
        "provider_session_id" varchar(80) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_CASINO_GAME_SESSIONS_ID" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_CASINO_SESSION_TOKEN" UNIQUE ("casino_session_token"),
        CONSTRAINT "UQ_CASINO_PROVIDER_SESSION_ID" UNIQUE ("provider_session_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_CASINO_GAME_SESSIONS_USER_ID" ON "CASINO_GAME_SESSIONS" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_CASINO_GAME_SESSIONS_WALLET_ID" ON "CASINO_GAME_SESSIONS" ("wallet_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_CASINO_GAME_SESSIONS_PROVIDER_ID" ON "CASINO_GAME_SESSIONS" ("provider_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_CASINO_GAME_SESSIONS_GAME_ID" ON "CASINO_GAME_SESSIONS" ("game_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "CASINO_TRANSACTIONS" (
        "id" varchar(40) NOT NULL,
        "wallet_id" varchar(40) NOT NULL,
        "type" "casino_transactions_type_enum" NOT NULL,
        "amount" bigint NOT NULL,
        "external_transaction_id" varchar(100) NOT NULL,
        "provider_round_id" varchar(80),
        "response_cache" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_CASINO_TRANSACTIONS_ID" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_CASINO_EXTERNAL_TX_ID" UNIQUE ("external_transaction_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_CASINO_TRANSACTIONS_WALLET_ID" ON "CASINO_TRANSACTIONS" ("wallet_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_CASINO_TRANSACTIONS_PROVIDER_ROUND_ID" ON "CASINO_TRANSACTIONS" ("provider_round_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "PROVIDER_GAMES" (
        "id" varchar(40) NOT NULL,
        "code" varchar(80) NOT NULL,
        "name" varchar(200) NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_PROVIDER_GAMES_ID" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_PROVIDER_GAMES_CODE" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "PROVIDER_CUSTOMERS" (
        "id" varchar(40) NOT NULL,
        "casino_user_id" varchar(40) NOT NULL,
        "display_name" varchar(120) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_PROVIDER_CUSTOMERS_ID" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_PROVIDER_CUSTOMERS_CASINO_USER_ID" UNIQUE ("casino_user_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "PROVIDER_GAME_SESSIONS" (
        "id" varchar(40) NOT NULL,
        "provider_game_id" varchar(40) NOT NULL,
        "customer_id" varchar(40) NOT NULL,
        "casino_session_id" varchar(80) NOT NULL,
        "provider_session_id" varchar(80) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_PROVIDER_GAME_SESSIONS_ID" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_PROVIDER_CASINO_SESSION_ID" UNIQUE ("casino_session_id"),
        CONSTRAINT "UQ_PROVIDER_PROVIDER_SESSION_ID" UNIQUE ("provider_session_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_PROVIDER_SESSIONS_GAME_ID" ON "PROVIDER_GAME_SESSIONS" ("provider_game_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_PROVIDER_SESSIONS_CUSTOMER_ID" ON "PROVIDER_GAME_SESSIONS" ("customer_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "PROVIDER_GAME_ROUNDS" (
        "id" varchar(40) NOT NULL,
        "provider_session_id" varchar(80) NOT NULL,
        "status" "provider_game_rounds_status_enum" NOT NULL DEFAULT 'OPEN',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_PROVIDER_GAME_ROUNDS_ID" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_PROVIDER_ROUNDS_SESSION_ID" ON "PROVIDER_GAME_ROUNDS" ("provider_session_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "PROVIDER_BETS" (
        "id" varchar(40) NOT NULL,
        "round_id" varchar(40) NOT NULL,
        "type" "provider_bets_type_enum" NOT NULL,
        "amount" bigint NOT NULL,
        "transaction_id" varchar(100) NOT NULL,
        "response_cache" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_PROVIDER_BETS_ID" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_PROVIDER_BETS_TRANSACTION_ID" UNIQUE ("transaction_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_PROVIDER_BETS_ROUND_ID" ON "PROVIDER_BETS" ("round_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_PROVIDER_BETS_ROUND_ID"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "PROVIDER_BETS"`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_PROVIDER_ROUNDS_SESSION_ID"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "PROVIDER_GAME_ROUNDS"`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_PROVIDER_SESSIONS_CUSTOMER_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_PROVIDER_SESSIONS_GAME_ID"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "PROVIDER_GAME_SESSIONS"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "PROVIDER_CUSTOMERS"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "PROVIDER_GAMES"`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_CASINO_TRANSACTIONS_PROVIDER_ROUND_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_CASINO_TRANSACTIONS_WALLET_ID"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "CASINO_TRANSACTIONS"`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_CASINO_GAME_SESSIONS_GAME_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_CASINO_GAME_SESSIONS_PROVIDER_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_CASINO_GAME_SESSIONS_WALLET_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_CASINO_GAME_SESSIONS_USER_ID"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "CASINO_GAME_SESSIONS"`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_CASINO_GAMES_PROVIDER_ID"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "CASINO_GAMES"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "CASINO_GAME_PROVIDERS"`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_CASINO_WALLETS_USER_ID"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "CASINO_WALLETS"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "CASINO_USERS"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "provider_bets_type_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "provider_game_rounds_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "casino_transactions_type_enum"`,
    );
  }
}
