import { IsString, Length } from 'class-validator';

export class CasinoOpenSessionRequestDto {
  @IsString()
  @Length(1, 120)
  username!: string;

  @IsString()
  @Length(1, 80)
  gameCode!: string;

  @IsString()
  @Length(1, 80)
  providerCode!: string;
}

export class CasinoOpenSessionResponseDto {
  casinoSessionToken!: string;
  providerSessionId!: string;
}
