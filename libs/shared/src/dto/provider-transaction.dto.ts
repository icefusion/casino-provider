import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class ProviderTransactionRequestDto {
  @IsString()
  @Length(1, 120)
  providerSessionId!: string;

  @IsString()
  @Length(1, 120)
  transactionId!: string; // idempotência

  @IsIn(['BET', 'WIN', 'ROLLBACK'])
  type!: 'BET' | 'WIN' | 'ROLLBACK';

  @IsInt()
  @Min(0)
  amount!: number; // centavos (int)

  @IsOptional()
  @IsString()
  @Length(1, 120)
  roundId?: string;
}

export class ProviderTransactionResponseDto {
  ok!: true;
}
