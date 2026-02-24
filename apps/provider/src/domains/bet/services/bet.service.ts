import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createId } from '@paralleldrive/cuid2';
import { Repository } from 'typeorm';

import { ProviderGameSessionEntity } from '../../session/entities/provider-game-session.entity';
import { ProviderTransactionRequestDto } from '../../../../../../libs/shared/src/dto/provider-transaction.dto';
import {
  ProviderBetEntity,
  ProviderBetType,
} from '../entities/provider-bet.entity';
import {
  ProviderGameRoundEntity,
  ProviderRoundStatus,
} from '../../round/entities/provider-game-round.entity';

@Injectable()
export class BetService {
  constructor(
    @InjectRepository(ProviderBetEntity)
    private readonly bets: Repository<ProviderBetEntity>,
    @InjectRepository(ProviderGameRoundEntity)
    private readonly rounds: Repository<ProviderGameRoundEntity>,
    @InjectRepository(ProviderGameSessionEntity)
    private readonly sessions: Repository<ProviderGameSessionEntity>,
  ) {}

  async register(dto: ProviderTransactionRequestDto): Promise<void> {
    const existing = await this.bets.findOne({
      where: { transactionId: dto.transactionId },
    });
    if (existing) {
      return;
    }

    const session = await this.sessions.findOne({
      where: { providerSessionId: dto.providerSessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    let roundId = dto.roundId;

    if (!roundId) {
      const open = await this.rounds.findOne({
        where: {
          providerSessionId: dto.providerSessionId,
          status: ProviderRoundStatus.OPEN,
        },
      });

      if (open) roundId = open.id;
    }

    if (!roundId) {
      const r = this.rounds.create({
        id: createId(),
        providerSessionId: dto.providerSessionId,
        status: ProviderRoundStatus.OPEN,
      });
      await this.rounds.save(r);
      roundId = r.id;
    }

    const bet = this.bets.create({
      id: createId(),
      roundId,
      type: dto.type as ProviderBetType,
      amount: String(dto.amount),
      transactionId: dto.transactionId,
      responseCache: null,
    });

    await this.bets.save(bet);
  }
}
