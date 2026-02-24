import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

export enum CasinoTransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  ROLLBACK = 'ROLLBACK',
}

@Entity({ name: 'CASINO_TRANSACTIONS' })
export class CasinoTransactionEntity {
  @PrimaryColumn('varchar', { length: 40 })
  id!: string;

  @Index()
  @Column('varchar', { name: 'wallet_id', length: 40 })
  walletId!: string;

  @Column({ type: 'enum', enum: CasinoTransactionType })
  type!: CasinoTransactionType;

  @Column('bigint')
  amount!: string;

  @Index({ unique: true })
  @Column('varchar', {
    name: 'external_transaction_id',
    length: 100,
    unique: true,
  })
  externalTransactionId!: string;

  @Index()
  @Column('varchar', { name: 'provider_round_id', length: 80, nullable: true })
  providerRoundId!: string | null;

  @Column('jsonb', { name: 'response_cache', nullable: true })
  responseCache!: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
