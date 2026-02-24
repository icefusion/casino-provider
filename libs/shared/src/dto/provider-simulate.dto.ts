import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class ProviderSimulateRequestDto {
  @IsString()
  @Length(1, 120)
  casinoSessionId!: string;

  @IsString()
  @Length(1, 120)
  providerSessionId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  betAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  winAmount?: number;
}

export type ProviderSimulateStep = {
  name: 'getBalance' | 'debit' | 'credit' | 'rollback';
  request: any;
  response: any;
};

export class ProviderSimulateResponseDto {
  ok!: true;
  steps!: ProviderSimulateStep[];
}
