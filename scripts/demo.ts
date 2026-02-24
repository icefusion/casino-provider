/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.demo' });

function signRawBody(rawBody: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

async function postJson(
  url: string,
  body: any,
  headers: Record<string, string> = {},
) {
  const rawBody = JSON.stringify(body);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: rawBody,
  });

  const text = await res.text().catch(() => '');
  let json: any = undefined;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }

  return { res, text, json, rawBody };
}

async function postCasinoSigned(path: string, body: any) {
  const casinoBaseUrl = process.env.CASINO_BASE_URL ?? 'http://localhost:3000';
  const casinoSecret = process.env.CASINO_SECRET ?? '';
  if (!casinoSecret) throw new Error('Missing CASINO_SECRET in .env.demo');

  const url = `${casinoBaseUrl.replace(/\/$/, '')}${path}`;
  const rawBody = JSON.stringify(body);
  const sig = signRawBody(rawBody, casinoSecret);

  return postJson(url, body, { 'x-casino-signature': sig });
}

async function postProviderSigned(path: string, body: any) {
  const providerBaseUrl =
    process.env.PROVIDER_BASE_URL ?? 'http://localhost:3002';
  const providerSecret = process.env.PROVIDER_SECRET ?? '';
  if (!providerSecret) throw new Error('Missing PROVIDER_SECRET in .env.demo');

  const url = `${providerBaseUrl.replace(/\/$/, '')}${path}`;
  const rawBody = JSON.stringify(body);
  const sig = signRawBody(rawBody, providerSecret);

  return postJson(url, body, { 'x-provider-signature': sig });
}

function expect(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function logCase(title: string) {
  console.log('\n==============================');
  console.log(title);
  console.log('==============================');
}

async function main() {
  const casinoBaseUrl = process.env.CASINO_BASE_URL ?? 'http://localhost:3000';

  const username = process.env.DEMO_USERNAME ?? 'player1';
  const providerCode = process.env.DEMO_PROVIDER_CODE ?? 'ACME_PROVIDER';
  const gameCode = process.env.DEMO_GAME_CODE ?? 'SLOTS_1';

  logCase('CASE 1) /casino/launchGame');
  const launchUrl = `${casinoBaseUrl.replace(/\/$/, '')}/casino/launchGame`;

  const launchRes = await postJson(launchUrl, {
    username,
    providerCode,
    gameCode,
  });
  console.log('status:', launchRes.res.status, launchRes.text);
  expect(launchRes.res.ok, 'launchGame must succeed');

  const casinoSessionToken = launchRes.json.casinoSessionToken;
  const providerSessionId = launchRes.json.providerSessionId;
  expect(typeof casinoSessionToken === 'string', 'casinoSessionToken missing');
  expect(typeof providerSessionId === 'string', 'providerSessionId missing');

  logCase('CASE 2) /provider/simulate (first run)');
  const simPayload = {
    casinoSessionId: casinoSessionToken,
    providerSessionId,
    betAmount: 10,
    winAmount: 15,
  };

  const sim1 = await postProviderSigned('/provider/simulate', simPayload);
  console.log('status:', sim1.res.status);
  console.log(JSON.stringify(sim1.json, null, 2));
  expect(sim1.res.ok, 'provider/simulate must succeed');

  logCase('CASE 3) /provider/simulate (second run - idempotency)');
  const sim2 = await postProviderSigned('/provider/simulate', simPayload);
  console.log('status:', sim2.res.status);
  expect(sim2.res.ok, 'second provider/simulate must also succeed');

  expect(sim2.json?.ok === true, 'simulate response ok must be true');

  logCase('CASE 4) /casino/rollback tombstone (missing original bet tx)');
  const tomb = await postCasinoSigned('/casino/rollback', {
    providerSessionId,
    transactionId: `rb_tomb_${casinoSessionToken}`,
    rollbackTransactionId: `missing_bet_${casinoSessionToken}`,
    roundId: casinoSessionToken,
  });

  console.log('status:', tomb.res.status);
  console.log(tomb.text);
  expect(tomb.res.ok, 'tombstone rollback must succeed');

  logCase('CASE 5) rollback after payout (must be 400)');
  const debitTxId = `debit_bad_${casinoSessionToken}`;
  const creditTxId = `credit_bad_${casinoSessionToken}`;

  const d = await postCasinoSigned('/casino/debit', {
    providerSessionId,
    transactionId: debitTxId,
    amount: 1,
    roundId: casinoSessionToken,
  });
  expect(d.res.ok, 'setup debit must succeed');

  const c = await postCasinoSigned('/casino/credit', {
    providerSessionId,
    transactionId: creditTxId,
    amount: 1,
    roundId: casinoSessionToken,
  });
  expect(c.res.ok, 'setup credit must succeed');

  const rbAfterPayout = await postCasinoSigned('/casino/rollback', {
    providerSessionId,
    transactionId: `rb_after_payout_${casinoSessionToken}`,
    rollbackTransactionId: debitTxId,
    roundId: casinoSessionToken,
  });

  console.log('status:', rbAfterPayout.res.status);
  console.log(rbAfterPayout.text);
  expect(
    rbAfterPayout.res.status === 400,
    'rollback after payout must be rejected (400)',
  );

  logCase('CASE 6) insufficient funds (must fail)');
  const tooBig = await postCasinoSigned('/casino/debit', {
    providerSessionId,
    transactionId: `debit_insuf_${casinoSessionToken}`,
    amount: 999999999999,
    roundId: casinoSessionToken,
  });

  console.log('status:', tooBig.res.status);
  console.log(tooBig.text);
  expect(!tooBig.res.ok, 'insufficient funds debit must fail');

  console.log('\n✅ DEMO finished OK');
}

main().catch((err) => {
  console.error('\n❌ DEMO failed:', err?.message ?? err);
  process.exit(1);
});
