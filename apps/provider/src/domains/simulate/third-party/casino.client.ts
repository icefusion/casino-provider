/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { signRawBody } from '@shared/shared';
import {
  CasinoCreditRequestDto,
  CasinoCreditResponseDto,
  CasinoDebitRequestDto,
  CasinoDebitResponseDto,
  CasinoGetBalanceRequestDto,
  CasinoGetBalanceResponseDto,
  CasinoRollbackRequestDto,
  CasinoRollbackResponseDto,
} from '@shared/shared';

@Injectable()
export class CasinoClient {
  private async post<TReq extends object, TRes>(
    url: string,
    secret: string,
    dto: TReq,
  ): Promise<TRes> {
    console.log('Body DTO: ', dto);
    const rawBody = JSON.stringify(dto);
    console.log('Raw Body: ', rawBody);
    const signature = signRawBody(rawBody, secret);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-casino-signature': signature,
      },
      body: rawBody,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Casino call failed (${res.status}): ${txt}`);
    }

    return (await res.json()) as TRes;
  }

  getBalance(params: {
    baseUrl: string;
    secret: string;
    dto: CasinoGetBalanceRequestDto;
  }): Promise<CasinoGetBalanceResponseDto> {
    const url = `${params.baseUrl.replace(/\/$/, '')}/casino/getBalance`;
    return this.post(url, params.secret, params.dto);
  }

  debit(params: {
    baseUrl: string;
    secret: string;
    dto: CasinoDebitRequestDto;
  }): Promise<CasinoDebitResponseDto> {
    const url = `${params.baseUrl.replace(/\/$/, '')}/casino/debit`;
    return this.post(url, params.secret, params.dto);
  }

  credit(params: {
    baseUrl: string;
    secret: string;
    dto: CasinoCreditRequestDto;
  }): Promise<CasinoCreditResponseDto> {
    const url = `${params.baseUrl.replace(/\/$/, '')}/casino/credit`;
    return this.post(url, params.secret, params.dto);
  }

  rollback(params: {
    baseUrl: string;
    secret: string;
    dto: CasinoRollbackRequestDto;
  }): Promise<CasinoRollbackResponseDto> {
    const url = `${params.baseUrl.replace(/\/$/, '')}/casino/rollback`;
    return this.post(url, params.secret, params.dto);
  }
}
