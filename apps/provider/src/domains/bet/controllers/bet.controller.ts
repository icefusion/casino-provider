import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BetService } from '../services/bet.service';
import {
  ProviderHmacGuard,
  ProviderTransactionRequestDto,
  ProviderTransactionResponseDto,
} from '@shared/shared';

@Controller('provider')
export class BetController {
  constructor(private readonly service: BetService) {}

  @Post('transactions')
  @UseGuards(ProviderHmacGuard)
  async registerTransaction(
    @Body() dto: ProviderTransactionRequestDto,
  ): Promise<ProviderTransactionResponseDto> {
    await this.service.register(dto);
    return { ok: true };
  }
}
