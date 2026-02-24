import { Injectable, BadRequestException } from '@nestjs/common';
import { CasinoClient } from '../third-party/casino.client';
import {
  ProviderSimulateRequestDto,
  ProviderSimulateResponseDto,
  ProviderSimulateStep,
  CasinoDebitRequestDto,
  CasinoCreditRequestDto,
} from '@shared/shared';

@Injectable()
export class SimulateService {
  constructor(private readonly casinoClient: CasinoClient) {}

  async simulate(
    dto: ProviderSimulateRequestDto,
  ): Promise<ProviderSimulateResponseDto> {
    const casinoBaseUrl =
      process.env.CASINO_BASE_URL ?? 'http://localhost:3000';
    const casinoSecret = process.env.CASINO_SECRET ?? '';

    if (!casinoSecret) {
      throw new Error('CASINO_SECRET is not set in environment variables');
    }

    const betAmount = dto.betAmount ?? 10;
    const winAmount = dto.winAmount ?? 15;

    if (betAmount <= 0) {
      throw new BadRequestException('betAmount invalid');
    }

    if (winAmount < 0) {
      throw new BadRequestException('winAmount invalid');
    }

    const steps: ProviderSimulateStep[] = [];

    const base = `${dto.casinoSessionId}:${dto.providerSessionId}`;
    const debitTxId = `debit_${base}`;
    const creditTxId = `credit_${base}`;

    const gbReq = { providerSessionId: dto.providerSessionId };
    const gbRes = await this.casinoClient.getBalance({
      baseUrl: casinoBaseUrl,
      secret: casinoSecret,
      dto: gbReq,
    });
    steps.push({ name: 'getBalance', request: gbReq, response: gbRes });

    const debitReq: CasinoDebitRequestDto = {
      providerSessionId: dto.providerSessionId,
      transactionId: debitTxId,
      amount: Number(betAmount),
      roundId: dto.casinoSessionId,
    };
    const debitRes = await this.casinoClient.debit({
      baseUrl: casinoBaseUrl,
      secret: casinoSecret,
      dto: debitReq,
    });
    steps.push({ name: 'debit', request: debitReq, response: debitRes });

    const creditReq: CasinoCreditRequestDto = {
      providerSessionId: dto.providerSessionId,
      transactionId: creditTxId,
      amount: Number(winAmount),
      roundId: dto.casinoSessionId,
    };
    const creditRes = await this.casinoClient.credit({
      baseUrl: casinoBaseUrl,
      secret: casinoSecret,
      dto: creditReq,
    });
    steps.push({ name: 'credit', request: creditReq, response: creditRes });

    return { ok: true, steps };
  }
}
