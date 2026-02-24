import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'CASINO_GAME_SESSIONS' })
export class CasinoGameSessionEntity {
  @PrimaryColumn('varchar', { length: 40 })
  id!: string;

  @Index()
  @Column('varchar', { name: 'user_id', length: 40 })
  userId!: string;

  @Index()
  @Column('varchar', { name: 'wallet_id', length: 40 })
  walletId!: string;

  @Index()
  @Column('varchar', { name: 'provider_id', length: 40 })
  providerId!: string;

  @Index()
  @Column('varchar', { name: 'game_id', length: 40 })
  gameId!: string;

  @Index({ unique: true })
  @Column('varchar', { name: 'casino_session_token', length: 80, unique: true })
  casinoSessionToken!: string;

  @Index({ unique: true })
  @Column('varchar', { name: 'provider_session_id', length: 80, unique: true })
  providerSessionId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
