import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyRawSignature } from '../crypto/hmac-signature';
import type { RawBodyRequest } from '../types/raw-body-request';

@Injectable()
export class CasinoHmacGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RawBodyRequest>();

    const secret = process.env.CASINO_SECRET;
    if (!secret) throw new UnauthorizedException('Missing CASINO_SECRET');

    const signature = req.header('x-casino-signature') ?? undefined;
    const rawBody = req.rawBody;

    const ok = verifyRawSignature(signature, rawBody, secret);
    if (!ok) throw new UnauthorizedException('Invalid x-casino-signature');

    return true;
  }
}
