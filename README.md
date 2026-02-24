# Casino & Provider – Technical Assessment

This repository implements the **Casino ↔ Provider** integration described in the *Senior Backend Engineer – Technical Assessment*.

The solution is built as a **NestJS monorepo**, containing two independent services that communicate via HTTP using **HMAC authentication**, while sharing the same PostgreSQL database with isolated schemas.

---

## Architecture Overview

- **Monorepo (NestJS)**
- Two services:
  - **Casino API** (`/casino/*`)
  - **Provider API** (`/provider/*`)
- Shared PostgreSQL database
  - Casino tables: `CASINO_*`
  - Provider tables: `PROVIDER_*`
- Casino ↔ Provider communication secured with **HMAC signatures**
- Full idempotency on all financial operations

---

## Tech Stack

- Node.js 18+
- NestJS
- TypeORM
- PostgreSQL
- Docker / Docker Compose
- HMAC (SHA256)

---

## Project Structure

```
apps/
  casino/
    src/domains/
      casino/
      session/
      wallet/
      transaction/
  provider/
    src/domains/
      session/
      round/
      bet/
libs/
  shared/
    crypto/
    guards/
    dto/
    types/
migrations/
migrations-scripts/
docker-compose.yml
.env.casino
.env.provider
```

---

## Environment Variables

### Casino (.env.casino)

```
PORT=3000
DATABASE_URL=postgres://casino:casino@localhost:5432/casino
CASINO_SECRET=c266cb7b0e4fe128dcac640fa96f199dbba0d98799a244dda599a7fa5220bdd8b
PROVIDER_SECRET=605a942fe159421b679c262957645c80dcdd21c9f9486075a4d079757078bd79
PROVIDER_BASE_URL=http://localhost:3002
```

### Provider (.env.provider)

```
PORT=3002
DATABASE_URL=postgres://casino:casino@localhost:5432/casino
CASINO_SECRET=c266cb7b0e4fe128dcac640fa96f199dbba0d98799a244dda599a7fa5220bdd8b
PROVIDER_SECRET=605a942fe159421b679c262957645c80dcdd21c9f9486075a4d079757078bd79
CASINO_BASE_URL=http://localhost:3000
```

### Demo (.env.demo)

```
CASINO_BASE_URL=http://localhost:3000
CASINO_SECRET=c266cb7b0e4fe128dcac640fa96f199dbba0d98799a244dda599a7fa5220bdd8b
PROVIDER_SECRET=605a942fe159421b679c262957645c80dcdd21c9f9486075a4d079757078bd79
DEMO_USERNAME=will@casino.local
DEMO_PROVIDER_CODE=ACME_PROVIDER
DEMO_GAME_CODE=SLOTS_1
DEMO_BET_AMOUNT=10
DEMO_WIN_AMOUNT=15
```

---

## Running the Project

### 1. Start PostgreSQL

```bash
docker compose up -d
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Run Database Migrations

```bash
npm run migration:run
```

---

### 4. Run Seed

The seed creates:
- Casino user
- Wallet with balance
- Game provider
- Games

```bash
npm run seed
```

---

### 5. Start Provider API

```bash
npx dotenv -e .env.provider -- npm run start:dev provider
```

Provider will be available at:
```
http://localhost:3002
```

---

### 6. Start Casino API

```bash
npx dotenv -e .env.casino -- npm run start:dev casino
```

Casino will be available at:
```
http://localhost:3000
```

---

## API Endpoints

### Casino

| Method | Endpoint | Description |
|------|--------|------------|
| POST | /casino/launchGame | Open a casino session |
| POST | /casino/simulateRound | Run a full simulated round |
| POST | /casino/getBalance | Get wallet balance |
| POST | /casino/debit | Debit wallet |
| POST | /casino/credit | Credit wallet |
| POST | /casino/rollback | Rollback a debit |


### Provider

| Method | Endpoint | Description |
|------|--------|------------|
| POST | /provider/launch | Open provider session |
| POST | /provider/simulate | Simulate a game round |
| POST | /provider/transactions | Register bet transaction |

---

## End-to-End Simulation Example

### Casino – Simulate Round

```bash
curl -X POST http://localhost:3000/casino/simulateRound \
  -H "Content-Type: application/json" \
  -d '{
    "username": "will@casino.local",
    "providerCode": "ACME_PROVIDER",
    "gameCode": "SLOTS_1",
    "betAmount": 100,
    "winAmount": 200
  }'
```

This will:
1. Open a casino session
2. Open a provider session
3. Call provider simulation
4. Trigger balance check, debit, credit and rollback logic
5. Persist all transactions with idempotency

---

## Security – HMAC

- **Casino → Provider**
  - Header: `x-provider-signature`
  - Secret: `PROVIDER_SECRET`

- **Provider → Casino**
  - Header: `x-casino-signature`
  - Secret: `CASINO_SECRET`

Both sides validate the raw request body signature exactly as described in the assessment PDF.
---

## Demo Runner (Automated)

The repository includes a small demo script that calls the main test-driver endpoint:
---
```bash
npm run demo
```
---

## Manual Endpoint Testing

This section shows how to manually call every endpoint, including HMAC signing where required.

HMAC signing helpers

The assessment requires HMAC-SHA256 of the raw request body, hex encoded, and sent as a header (the header name identifies the receiving system).

Casino → Provider: x-provider-signature using PROVIDER_SECRET

Provider → Casino: x-casino-signature using CASINO_SECRET

(Exactly as described in the PDF.)

Node one-liner (recommended)

Provider signature (calling Provider endpoints):

```bash
SIG=$(node -e "const crypto=require('crypto'); const body=process.argv[1]; const secret=process.env.PROVIDER_SECRET; process.stdout.write(crypto.createHmac('sha256', secret).update(body).digest('hex'))" "$BODY")
```

Casino signature (calling Casino endpoints):

```bash
SIG=$(node -e "const crypto=require('crypto'); const body=process.argv[1]; const secret=process.env.CASINO_SECRET; process.stdout.write(crypto.createHmac('sha256', secret).update(body).digest('hex'))" "$BODY")
```

## Casino API (manual)
### 1) Launch Game (no HMAC, frontend-like)

```bash
BODY='{"username":"player1","providerCode":"demo-provider","gameCode":"demo-game"}'

curl -s -X POST http://localhost:3000/casino/launchGame \
  -H "content-type: application/json" \
  -d "$BODY"
```

Expected response:

```JSON
{
  "casinoSessionToken": "...",
  "providerSessionId": "..."
}
```

### 2) Simulate Round (no HMAC, test-driver)

```bash
BODY='{"username":"player1","providerCode":"demo-provider","gameCode":"demo-game","betAmount":10,"winAmount":15}'

curl -s -X POST http://localhost:3000/casino/simulateRound \
  -H "content-type: application/json" \
  -d "$BODY"
```

Expected response includes:
```
ok: true

casinoSessionToken

providerSessionId

steps[]
```

This endpoint exists specifically to demonstrate the full end-to-end flow required by the assessment.

## Provider API (manual)

```bash
export PROVIDER_SECRET=provider-secret

BODY='{"casinoSessionId":"<CASINO_SESSION_TOKEN>","providerSessionId":"<PROVIDER_SESSION_ID>","betAmount":10,"winAmount":15}'
SIG=$(node -e "const crypto=require('crypto'); const body=process.argv[1]; const secret=process.env.PROVIDER_SECRET; process.stdout.write(crypto.createHmac('sha256', secret).update(body).digest('hex'))" "$BODY")

curl -s -X POST http://localhost:3002/provider/simulate \
  -H "content-type: application/json" \
  -H "x-provider-signature: $SIG" \
  -d "$BODY"
```

Expected response:

```JSON
{ ok: true, steps: [...] }
```

## Casino Callbacks (manual)

These are called by the Provider in real flow, but can be tested manually.

### 5) Get Balance (requires HMAC: x-casino-signature)

```bash
export CASINO_SECRET=casino-secret

BODY='{"providerSessionId":"<PROVIDER_SESSION_ID>"}'
SIG=$(node -e "const crypto=require('crypto'); const body=process.argv[1]; const secret=process.env.CASINO_SECRET; process.stdout.write(crypto.createHmac('sha256', secret).update(body).digest('hex'))" "$BODY")

curl -s -X POST http://localhost:3000/casino/getBalance \
  -H "content-type: application/json" \
  -H "x-casino-signature: $SIG" \
  -d "$BODY"
```

### 6) Debit (requires HMAC: x-casino-signature)

```bash
export CASINO_SECRET=casino-secret

BODY='{"providerSessionId":"<PROVIDER_SESSION_ID>","transactionId":"debit_test_001","amount":10,"roundId":"<ROUND_ID>"}'
SIG=$(node -e "const crypto=require('crypto'); const body=process.argv[1]; const secret=process.env.CASINO_SECRET; process.stdout.write(crypto.createHmac('sha256', secret).update(body).digest('hex'))" "$BODY")

curl -s -X POST http://localhost:3000/casino/debit \
  -H "content-type: application/json" \
  -H "x-casino-signature: $SIG" \
  -d "$BODY"
```

### 7) Credit (requires HMAC: x-casino-signature)

```bash
export CASINO_SECRET=casino-secret

BODY='{"providerSessionId":"<PROVIDER_SESSION_ID>","transactionId":"credit_test_001","amount":15,"roundId":"<ROUND_ID>"}'
SIG=$(node -e "const crypto=require('crypto'); const body=process.argv[1]; const secret=process.env.CASINO_SECRET; process.stdout.write(crypto.createHmac('sha256', secret).update(body).digest('hex'))" "$BODY")

curl -s -X POST http://localhost:3000/casino/credit \
  -H "content-type: application/json" \
  -H "x-casino-signature: $SIG" \
  -d "$BODY"
```

### 8) Rollback (requires HMAC: x-casino-signature)

```bash
export CASINO_SECRET=casino-secret

BODY='{"providerSessionId":"<PROVIDER_SESSION_ID>","transactionId":"rollback_test_001","rollbackTransactionId":"debit_test_001","roundId":"<ROUND_ID>"}'
SIG=$(node -e "const crypto=require('crypto'); const body=process.argv[1]; const secret=process.env.CASINO_SECRET; process.stdout.write(crypto.createHmac('sha256', secret).update(body).digest('hex'))" "$BODY")

curl -s -X POST http://localhost:3000/casino/rollback \
  -H "content-type: application/json" \
  -H "x-casino-signature: $SIG" \
  -d "$BODY"
```

## Test Sequence (Matches the PDF Requirements)

The assessment explicitly evaluates:

End-to-end simulation (/casino/simulateRound → /provider/simulate)

Balance integrity + atomic debits/credits

Idempotency on money-moving endpoints

Rollback rules and tombstones

### A) End-to-end happy path

Run:

POST /casino/simulateRound with betAmount=10, winAmount=15

Confirm:

steps contains getBalance, debit, credit, rollback

no unexpected errors

### B) Idempotency checks (must not double-charge / double-pay)

Repeat the same call (same session + same transaction IDs) and confirm:

balance does not change a second time

response matches cached response

The PDF requires idempotency for /casino/debit, /casino/credit, /casino/rollback.

### C) Insufficient balance

Call /casino/debit with amount greater than wallet balance:

Expect 400 Bad Request (or equivalent)

Balance must remain unchanged

### D) Rollback rules (expected failures)

Do a debit

Do a credit for the same round

Try rollback for the debit

Expected: rollback must be rejected (no rollback after payout)

### E) Tombstone rollback (original debit not found)

Call /casino/rollback referencing a non-existent rollbackTransactionId:

Expected: return success with no balance change

Must record an idempotency marker (tombstone behavior)

## Notes

- All wallet mutations are executed inside database transactions
- Wallet rows are locked with `pessimistic_write`
- Idempotency is enforced via `externalTransactionId`
- Rollbacks follow strict business rules (only DEBIT, no rollback after payout)

---

## Status

✅ Database schema and migrations
✅ HMAC authentication
✅ Idempotent transactions
✅ Casino ↔ Provider integration
✅ End-to-end simulation

This implementation fully satisfies the requirements described in the technical assessment.

