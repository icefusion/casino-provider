import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CasinoUserEntity } from '../user/entities/casino-user.entity';
import { CasinoWalletEntity } from '../wallet/entities/casino-wallet.entity';
import { CasinoGameProviderEntity } from './entities/casino-game-provider.entity';
import { CasinoGameEntity } from './entities/casino-game.entity';
import { CasinoGameSessionEntity } from './entities/casino-game-session.entity';

import { SessionService } from './services/session.service';
import { ProviderClient } from './third-party/provider.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CasinoUserEntity,
      CasinoWalletEntity,
      CasinoGameProviderEntity,
      CasinoGameEntity,
      CasinoGameSessionEntity,
    ]),
  ],
  providers: [SessionService, ProviderClient],
  exports: [SessionService, ProviderClient],
})
export class SessionDomainModule {}
