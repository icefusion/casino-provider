import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'PROVIDER_GAME_SESSIONS' })
export class ProviderGameSessionEntity {
  @PrimaryColumn('varchar', { length: 40 })
  id!: string;

  @Index()
  @Column('varchar', { name: 'provider_game_id', length: 40 })
  providerGameId!: string;

  @Index()
  @Column('varchar', { name: 'customer_id', length: 40 })
  customerId!: string;

  @Index({ unique: true })
  @Column('varchar', { name: 'casino_session_id', length: 80, unique: true })
  casinoSessionId!: string;

  @Index({ unique: true })
  @Column('varchar', { name: 'provider_session_id', length: 80, unique: true })
  providerSessionId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
