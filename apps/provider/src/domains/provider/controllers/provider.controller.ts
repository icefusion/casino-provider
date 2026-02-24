import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ProviderHmacGuard,
  ProviderOpenSessionRequestDto,
  ProviderOpenSessionResponseDto,
} from '@shared/shared';
import { SessionService } from '../../session/services/session.service';

@Controller('provider')
export class ProviderController {
  constructor(private readonly service: SessionService) {}

  @UseGuards(ProviderHmacGuard)
  @Post('launch')
  launch(
    @Body() dto: ProviderOpenSessionRequestDto,
  ): Promise<ProviderOpenSessionResponseDto> {
    return this.service.openSession(dto);
  }
}
