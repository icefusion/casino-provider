import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionDomainModule } from '../session/session.module';

import { CasinoWalletEntity } from '../wallet/entities/casino-wallet.entity';
import { CasinoGameSessionEntity } from '../session/entities/casino-game-session.entity';
import { CasinoTransactionEntity } from '../transaction/entities/casino-transaction.entity';

import { CasinoController } from './controllers/casino.controller';
import { CasinoService } from './services/casino.service';
import { CasinoGameProviderEntity } from '../session/entities/casino-game-provider.entity';

@Module({
  imports: [
    SessionDomainModule,
    TypeOrmModule.forFeature([
      CasinoWalletEntity,
      CasinoGameSessionEntity,
      CasinoTransactionEntity,
      CasinoGameProviderEntity,
    ]),
  ],
  controllers: [CasinoController],
  providers: [CasinoService],
})
export class CasinoDomainModule {}
