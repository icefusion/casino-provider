import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CasinoSimulateRoundRequestDto {
  @IsString()
  @Length(1, 120)
  username!: string;

  @IsString()
  @Length(1, 80)
  gameCode!: string;

  @IsString()
  @Length(1, 80)
  providerCode!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  betAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  winAmount?: number;
}

export type CasinoSimulateRoundResponseDto = {
  ok: true;
  casinoSessionToken: string;
  providerSessionId: string;
  steps: Array<{ name: string; response: any }>;
};
