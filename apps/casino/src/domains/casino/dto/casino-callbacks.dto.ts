import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CasinoGetBalanceRequestDto {
  @IsString()
  @Length(1, 80)
  providerSessionId!: string;
}

export class CasinoGetBalanceResponseDto {
  balance!: string;
  currency!: string;
}

export class CasinoDebitRequestDto {
  @IsString()
  @Length(1, 80)
  providerSessionId!: string;

  @IsString()
  @Length(1, 100)
  transactionId!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  roundId?: string;
}

export class CasinoDebitResponseDto {
  ok!: true;
  balance!: string;
  currency!: string;
}

export class CasinoCreditRequestDto {
  @IsString()
  @Length(1, 80)
  providerSessionId!: string;

  @IsString()
  @Length(1, 100)
  transactionId!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  roundId?: string;
}

export class CasinoCreditResponseDto {
  ok!: true;
  balance!: string;
  currency!: string;
}

export class CasinoRollbackRequestDto {
  @IsString()
  @Length(1, 80)
  providerSessionId!: string;

  @IsString()
  @Length(1, 100)
  transactionId!: string;

  @IsString()
  @Length(1, 100)
  rollbackTransactionId!: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  roundId?: string;
}

export class CasinoRollbackResponseDto {
  ok!: true;
  balance!: string;
  currency!: string;
  rolledBack!: boolean;
}
