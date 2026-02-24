import { Injectable } from '@nestjs/common';
import {
  ProviderOpenSessionRequestDto,
  ProviderOpenSessionResponseDto,
  signBody,
  signRawBody,
} from '@shared/shared';
import {
  ProviderSimulateRequest,
  ProviderSimulateResponse,
} from './third-party.types';
import crypto from 'crypto';

@Injectable()
export class ProviderClient {
  async openSession(params: {
    baseUrl: string;
    secret: string;
    dto: ProviderOpenSessionRequestDto;
  }): Promise<ProviderOpenSessionResponseDto> {
    const url = `${params.baseUrl.replace(/\/$/, '')}/provider/launch`;

    const rawBody = JSON.stringify(params.dto);
    console.log('Raw Body: ', rawBody);
    const signature = signRawBody(rawBody, params.secret);

    console.log('[HMAC CASINO] signature sent:', signature);
    console.log(
      '[HMAC CASINO] secret sha256:',
      crypto.createHash('sha256').update(params.secret).digest('hex'),
    );
    console.log('[HMAC CASINO] rawBody:', rawBody);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-provider-signature': signature,
      },
      body: rawBody,
    });

    console.log('URL: ', url);
    console.log('Request Body: ', rawBody);
    console.log('Provider launch: ', res);

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Provider launch failed (${res.status}): ${txt}`);
    }

    const data: unknown = await res.json();

    return data as ProviderOpenSessionResponseDto;
  }

  async simulate(params: {
    baseUrl: string;
    secret: string;
    dto: ProviderSimulateRequest;
  }): Promise<ProviderSimulateResponse> {
    const url = `${params.baseUrl.replace(/\/$/, '')}/provider/simulate`;
    const rawBody = JSON.stringify(params.dto);

    const signature = signBody(params.dto, params.secret);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-provider-signature': signature,
      },
      body: rawBody,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Provider simulate failed (${res.status}): ${txt}`);
    }

    const data: unknown = await res.json();
    return data as ProviderSimulateResponse;
  }
}
