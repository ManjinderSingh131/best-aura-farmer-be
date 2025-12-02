import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuraFarmer {
  @PrimaryGeneratedColumn()
  auraFarmerId: number;

  @Column()
  name: string;

  @Column()
  origin: string;

  @Column({nullable: true})
  characterAvatar: string;

  @Column()
  description: string;

  @Column({ default: 0 })
  votes: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
