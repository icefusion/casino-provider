import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'CASINO_GAME_PROVIDERS' })
export class CasinoGameProviderEntity {
  @PrimaryColumn('varchar', { length: 40 })
  id!: string;

  @Index({ unique: true })
  @Column('varchar', { length: 80, unique: true })
  code!: string;

  @Column('varchar', { length: 200 })
  name!: string;

  @Column('varchar', { name: 'base_url', length: 300 })
  baseUrl!: string;

  @Column('varchar', { name: 'provider_secret', length: 200 })
  providerSecret!: string;

  @Column('boolean', { default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
