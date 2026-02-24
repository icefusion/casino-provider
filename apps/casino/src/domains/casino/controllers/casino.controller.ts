import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from '../../session/services/session.service';
import {
  CasinoOpenSessionRequestDto,
  CasinoOpenSessionResponseDto,
} from '../../session/dto/open-session.dto';
import { CasinoHmacGuard } from '@shared/shared';
import { CasinoService } from '../services/casino.service';
import {
  CasinoCreditRequestDto,
  CasinoCreditResponseDto,
  CasinoDebitRequestDto,
  CasinoDebitResponseDto,
  CasinoGetBalanceRequestDto,
  CasinoGetBalanceResponseDto,
  CasinoRollbackRequestDto,
  CasinoRollbackResponseDto,
} from '../dto/casino-callbacks.dto';
import {
  CasinoSimulateRoundRequestDto,
  CasinoSimulateRoundResponseDto,
} from '../dto/simulate-round.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CasinoGameProviderEntity } from '../../session/entities/casino-game-provider.entity';
import { ProviderClient } from '../../session/third-party/provider.client';
import { Repository } from 'typeorm';

@Controller('casino')
export class CasinoController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly casinoService: CasinoService,
    private readonly providerClient: ProviderClient,
    @InjectRepository(CasinoGameProviderEntity)
    private readonly providers: Repository<CasinoGameProviderEntity>,
  ) {}

  @Post('launchGame')
  launchGame(
    @Body() dto: CasinoOpenSessionRequestDto,
  ): Promise<CasinoOpenSessionResponseDto> {
    return this.sessionService.open(dto);
  }

  @Post('simulateRound')
  async simulateRound(
    @Body() dto: CasinoSimulateRoundRequestDto,
  ): Promise<CasinoSimulateRoundResponseDto> {
    const session = await this.sessionService.open(dto);

    const provider = await this.providers.findOne({
      where: { code: dto.providerCode },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const simulateRes = await this.providerClient.simulate({
      baseUrl: provider.baseUrl,
      secret: provider.providerSecret,
      dto: {
        casinoSessionId: session.casinoSessionToken,
        providerSessionId: session.providerSessionId,
        betAmount: dto.betAmount,
        winAmount: dto.winAmount,
      },
    });

    return {
      ok: true,
      casinoSessionToken: session.casinoSessionToken,
      providerSessionId: session.providerSessionId,
      steps: simulateRes.steps,
    };
  }

  @UseGuards(CasinoHmacGuard)
  @Post('getBalance')
  getBalance(
    @Body() dto: CasinoGetBalanceRequestDto,
  ): Promise<CasinoGetBalanceResponseDto> {
    return this.casinoService.getBalance(dto);
  }

  @UseGuards(CasinoHmacGuard)
  @Post('debit')
  debit(@Body() dto: CasinoDebitRequestDto): Promise<CasinoDebitResponseDto> {
    return this.casinoService.debit(dto);
  }

  @UseGuards(CasinoHmacGuard)
  @Post('credit')
  credit(
    @Body() dto: CasinoCreditRequestDto,
  ): Promise<CasinoCreditResponseDto> {
    return this.casinoService.credit(dto);
  }

  @UseGuards(CasinoHmacGuard)
  @Post('rollback')
  rollback(
    @Body() dto: CasinoRollbackRequestDto,
  ): Promise<CasinoRollbackResponseDto> {
    return this.casinoService.rollback(dto);
  }
}
