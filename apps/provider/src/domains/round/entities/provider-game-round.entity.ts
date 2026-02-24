import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

export enum ProviderRoundStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity({ name: 'PROVIDER_GAME_ROUNDS' })
export class ProviderGameRoundEntity {
  @PrimaryColumn('varchar', { length: 40 })
  id!: string;

  @Index()
  @Column('varchar', { name: 'provider_session_id', length: 80 })
  providerSessionId!: string;

  @Column({
    type: 'enum',
    enum: ProviderRoundStatus,
    default: ProviderRoundStatus.OPEN,
  })
  status!: ProviderRoundStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
