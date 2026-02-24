import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CasinoModule } from './casino.module';

async function bootstrap() {
  const app = await NestFactory.create(CasinoModule, {
    rawBody: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`[casino] listening on :${port}`);
}
bootstrap();
