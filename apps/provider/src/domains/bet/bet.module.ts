import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProviderBetEntity } from './entities/provider-bet.entity';
import { ProviderGameRoundEntity } from '../round/entities/provider-game-round.entity'; // ajuste o caminho se necessário
import { ProviderGameSessionEntity } from '../session/entities/provider-game-session.entity';
import { BetController } from './controllers/bet.controller';
import { BetService } from './services/bet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderBetEntity,
      ProviderGameRoundEntity,
      ProviderGameSessionEntity,
    ]),
  ],
  controllers: [BetController],
  providers: [BetService],
})
export class BetDomainModule {}
