import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createId } from '@paralleldrive/cuid2';
import { Repository } from 'typeorm';

import { ProviderCustomerEntity } from '../entities/provider-customer.entity';
import { ProviderGameEntity } from '../entities/provider-game.entity';
import { ProviderGameSessionEntity } from '../entities/provider-game-session.entity';
import {
  ProviderOpenSessionRequestDto,
  ProviderOpenSessionResponseDto,
} from '../../../../../../libs/shared/src/dto/provider-session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(ProviderCustomerEntity)
    private readonly customers: Repository<ProviderCustomerEntity>,
    @InjectRepository(ProviderGameEntity)
    private readonly games: Repository<ProviderGameEntity>,
    @InjectRepository(ProviderGameSessionEntity)
    private readonly sessions: Repository<ProviderGameSessionEntity>,
  ) {}

  async openSession(
    dto: ProviderOpenSessionRequestDto,
  ): Promise<ProviderOpenSessionResponseDto> {
    const existing = await this.sessions.findOne({
      where: { casinoSessionId: dto.casinoSessionId },
    });

    if (existing) {
      return {
        providerSessionId: existing.providerSessionId,
        customerId: existing.customerId,
        providerGameId: existing.providerGameId,
      };
    }

    const game = await this.games.findOne({ where: { code: dto.gameCode } });
    if (!game) {
      throw new NotFoundException(`Game not found: ${dto.gameCode}`);
    }

    let customer = await this.customers.findOne({
      where: { casinoUserId: dto.casinoUserId },
    });

    if (!customer) {
      customer = this.customers.create({
        id: createId(),
        casinoUserId: dto.casinoUserId,
        displayName: dto.casinoUserId,
      });
      await this.customers.save(customer);
    }

    const session = this.sessions.create({
      id: createId(),
      providerGameId: game.id,
      customerId: customer.id,
      casinoSessionId: dto.casinoSessionId,
      providerSessionId: createId(),
    });

    await this.sessions.save(session);

    return {
      providerSessionId: session.providerSessionId,
      customerId: customer.id,
      providerGameId: game.id,
    };
  }
}
