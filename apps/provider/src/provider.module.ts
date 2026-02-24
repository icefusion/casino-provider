import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionDomainModule } from './domains/session/session.module';
import { BetDomainModule } from './domains/bet/bet.module';
import { HealthcheckModule } from './domains/healthcheck/healthcheck.module';
import { SimulateDomainModule } from './domains/simulate/simulate.module';
import { ProviderController } from './domains/provider/controllers/provider.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false,
      autoLoadEntities: true,
    }),

    SessionDomainModule,
    BetDomainModule,
    SimulateDomainModule,
    HealthcheckModule,
  ],
  controllers: [ProviderController],
})
export class ProviderModule {}
