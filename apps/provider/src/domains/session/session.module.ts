import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProviderCustomerEntity } from './entities/provider-customer.entity';
import { ProviderGameEntity } from './entities/provider-game.entity';
import { ProviderGameSessionEntity } from './entities/provider-game-session.entity';
import { SessionService } from './services/session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderCustomerEntity,
      ProviderGameEntity,
      ProviderGameSessionEntity,
    ]),
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionDomainModule {}
