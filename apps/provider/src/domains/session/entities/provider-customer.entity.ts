import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'PROVIDER_CUSTOMERS' })
export class ProviderCustomerEntity {
  @PrimaryColumn('varchar', { length: 40 })
  id!: string;

  @Index({ unique: true })
  @Column('varchar', { name: 'casino_user_id', length: 40, unique: true })
  casinoUserId!: string;

  @Column('varchar', { name: 'display_name', length: 120 })
  displayName!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
