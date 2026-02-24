import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller('healthcheck')
export class HealthCheckController {
  @Get()
  @HttpCode(200)
  health() {
    return { ok: true, service: 'Provider Healthcheck' };
  }
}
