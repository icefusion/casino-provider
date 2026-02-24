import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthcheckModule } from './domains/healthcheck/healthcheck.module';
import { CasinoDomainModule } from './domains/casino/casino-domain.module';
import { SessionDomainModule } from './domains/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false,
      autoLoadEntities: true,
    }),

    HealthcheckModule,
    SessionDomainModule,
    CasinoDomainModule,
  ],
})
export class CasinoModule {}
