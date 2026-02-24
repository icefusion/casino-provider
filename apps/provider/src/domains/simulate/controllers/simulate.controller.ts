import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ProviderHmacGuard,
  ProviderSimulateRequestDto,
  ProviderSimulateResponseDto,
} from '@shared/shared';
import { SimulateService } from '../services/simulate.service';

@Controller('provider')
export class SimulateController {
  constructor(private readonly service: SimulateService) {}

  @Post('simulate')
  @UseGuards(ProviderHmacGuard)
  simulate(
    @Body() dto: ProviderSimulateRequestDto,
  ): Promise<ProviderSimulateResponseDto> {
    return this.service.simulate(dto);
  }
}
