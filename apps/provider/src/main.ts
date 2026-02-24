/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { ProviderModule } from './provider.module';

async function bootstrap() {
  const app = await NestFactory.create(ProviderModule, {
    rawBody: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.use(
    json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf?.toString('utf8') ?? '';
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port);
  console.log(`[provider] listening on :${port}`);
}
bootstrap();
