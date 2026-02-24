import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'CASINO_WALLETS' })
export class CasinoWalletEntity {
  @PrimaryColumn('varchar', { length: 40 })
  id!: string;

  @Index()
  @Column('varchar', { name: 'user_id', length: 40 })
  userId!: string;

  @Column('bigint', { default: 0 })
  balance!: string;

  @Column('varchar', { length: 8, default: 'BRL' })
  currency!: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
