import { Module } from '@nestjs/common';
import { SimulateController } from './controllers/simulate.controller';
import { SimulateService } from './services/simulate.service';
import { CasinoClient } from './third-party/casino.client';

@Module({
  controllers: [SimulateController],
  providers: [SimulateService, CasinoClient],
})
export class SimulateDomainModule {}
