import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createId } from '@paralleldrive/cuid2';
import { Repository } from 'typeorm';
import { CasinoUserEntity } from '../../user/entities/casino-user.entity';
import { CasinoWalletEntity } from '../../wallet/entities/casino-wallet.entity';
import { CasinoGameProviderEntity } from '../entities/casino-game-provider.entity';
import { CasinoGameEntity } from '../entities/casino-game.entity';
import { CasinoGameSessionEntity } from '../entities/casino-game-session.entity';
import {
  CasinoOpenSessionRequestDto,
  CasinoOpenSessionResponseDto,
} from '../dto/open-session.dto';
import { ProviderClient } from '../third-party/provider.client';
import { ProviderOpenSessionRequestDto } from '@shared/shared';

@Injectable()
export class SessionService {
  constructor(
    private readonly providerClient: ProviderClient,

    @InjectRepository(CasinoUserEntity)
    private readonly users: Repository<CasinoUserEntity>,
    @InjectRepository(CasinoWalletEntity)
    private readonly wallets: Repository<CasinoWalletEntity>,
    @InjectRepository(CasinoGameProviderEntity)
    private readonly providers: Repository<CasinoGameProviderEntity>,
    @InjectRepository(CasinoGameEntity)
    private readonly games: Repository<CasinoGameEntity>,
    @InjectRepository(CasinoGameSessionEntity)
    private readonly sessions: Repository<CasinoGameSessionEntity>,
  ) {}

  async open(
    dto: CasinoOpenSessionRequestDto,
  ): Promise<CasinoOpenSessionResponseDto> {
    const user = await this.users.findOne({
      where: { username: dto.username },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wallet = await this.wallets.findOne({ where: { userId: user.id } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const provider = await this.providers.findOne({
      where: { code: dto.providerCode },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const game = await this.games.findOne({ where: { code: dto.gameCode } });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const casinoSessionToken = createId();

    const providerReq: ProviderOpenSessionRequestDto = {
      casinoUserId: user.id,
      casinoSessionId: casinoSessionToken,
      gameCode: dto.gameCode,
    };

    const providerRes = await this.providerClient.openSession({
      baseUrl: provider.baseUrl,
      secret: provider.providerSecret,
      dto: providerReq,
    });

    const session = this.sessions.create({
      id: createId(),
      userId: user.id,
      walletId: wallet.id,
      providerId: provider.id,
      gameId: game.id,
      casinoSessionToken,
      providerSessionId: providerRes.providerSessionId,
    });

    await this.sessions.save(session);

    return {
      casinoSessionToken,
      providerSessionId: providerRes.providerSessionId,
    };
  }
}
