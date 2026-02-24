import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'CASINO_GAMES' })
export class CasinoGameEntity {
  @PrimaryColumn('varchar', { length: 40 })
  id!: string;

  @Index()
  @Column('varchar', { name: 'provider_id', length: 40 })
  providerId!: string;

  @Index({ unique: true })
  @Column('varchar', { length: 80, unique: true })
  code!: string;

  @Column('varchar', { length: 200 })
  name!: string;

  @Column('boolean', { default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
