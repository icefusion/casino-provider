import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'CASINO_USERS' })
export class CasinoUserEntity {
  @PrimaryColumn('varchar', { length: 40 })
  id!: string;

  @Index({ unique: true })
  @Column('varchar', { length: 120, unique: true })
  username!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
