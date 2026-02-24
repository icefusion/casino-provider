import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyRawSignature } from '../crypto/hmac-signature';
import type { RawBodyRequest } from '../types/raw-body-request';
import crypto from 'crypto';

@Injectable()
export class ProviderHmacGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RawBodyRequest>();

    const secret = process.env.PROVIDER_SECRET;
    if (!secret) throw new UnauthorizedException('Missing PROVIDER_SECRET');

    const signature = req.header('x-provider-signature') ?? undefined;
    const rawBody = req.rawBody;

    const secretHash = crypto
      .createHash('sha256')
      .update(secret ?? '')
      .digest('hex');

    console.log('[HMAC PROVIDER] signature header:', signature);
    console.log('[HMAC PROVIDER] rawBody:', rawBody);
    console.log('[HMAC PROVIDER] secret sha256:', secretHash);

    const ok = verifyRawSignature(signature, rawBody, secret);
    if (!ok) throw new UnauthorizedException('Invalid x-provider-signature');

    return true;
  }
}
