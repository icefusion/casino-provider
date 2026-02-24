import { IsString, Length } from 'class-validator';

export class ProviderOpenSessionRequestDto {
  @IsString()
  @Length(1, 120)
  casinoUserId!: string;

  @IsString()
  @Length(1, 120)
  casinoSessionId!: string;

  @IsString()
  @Length(1, 80)
  gameCode!: string;
}

export class ProviderOpenSessionResponseDto {
  providerSessionId!: string;
  customerId!: string;
  providerGameId!: string;
}
