import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CasinoGetBalanceRequestDto {
  @IsString()
  @Length(1, 120)
  providerSessionId!: string;
}

export class CasinoGetBalanceResponseDto {
  balance!: string;
  currency!: string;
}

export class CasinoDebitRequestDto {
  @IsString()
  @Length(1, 120)
  providerSessionId!: string;

  @IsString()
  @Length(1, 120)
  transactionId!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  roundId?: string;
}

export class CasinoDebitResponseDto {
  ok!: boolean;
  balance!: string;
  currency!: string;
}

export class CasinoCreditRequestDto {
  @IsString()
  @Length(1, 120)
  providerSessionId!: string;

  @IsString()
  @Length(1, 120)
  transactionId!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  roundId?: string;
}

export class CasinoCreditResponseDto {
  ok!: boolean;
  balance!: string;
  currency!: string;
}

export class CasinoRollbackRequestDto {
  @IsString()
  @Length(1, 120)
  providerSessionId!: string;

  @IsString()
  @Length(1, 120)
  transactionId!: string;

  @IsString()
  @Length(1, 120)
  rollbackTransactionId!: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  roundId?: string;
}

export class CasinoRollbackResponseDto {
  ok!: boolean;
  balance!: string;
  currency!: string;
  rolledBack!: boolean;
}
