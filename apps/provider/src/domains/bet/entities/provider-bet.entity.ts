import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

export enum ProviderBetType {
  BET = 'BET',
  WIN = 'WIN',
  ROLLBACK = 'ROLLBACK',
}

@Entity({ name: 'PROVIDER_BETS' })
export class ProviderBetEntity {
  @PrimaryColumn('varchar', { length: 40 })
  id!: string;

  @Index()
  @Column('varchar', { name: 'round_id', length: 40 })
  roundId!: string;

  @Column({ type: 'enum', enum: ProviderBetType })
  type!: ProviderBetType;

  @Column('bigint')
  amount!: string;

  @Index({ unique: true })
  @Column('varchar', { name: 'transaction_id', length: 100, unique: true })
  transactionId!: string;

  @Column('jsonb', { name: 'response_cache', nullable: true })
  responseCache!: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
