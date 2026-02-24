import crypto from 'crypto';

export function signRawBody(rawBody: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

export function signBody(body: unknown, secret: string): string {
  return signRawBody(JSON.stringify(body), secret);
}

export function verifyRawSignature(
  providedSig: string | undefined,
  rawBody: string | undefined,
  secret: string,
): boolean {
  if (!providedSig || !rawBody) return false;

  const expected = signRawBody(rawBody, secret);

  try {
    const a = Buffer.from(providedSig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
