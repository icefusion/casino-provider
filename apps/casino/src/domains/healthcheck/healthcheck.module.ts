import { Module } from '@nestjs/common';
import { HealthCheckController } from './controllers/healthcheck.controller';

@Module({
  controllers: [HealthCheckController],
})
export class HealthcheckModule {}
