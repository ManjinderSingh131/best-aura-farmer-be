import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuraFarmShowcase {
  @PrimaryGeneratedColumn()
  auraFarmShowcaseId: number;

  @Column()
  auraFarmerId: number;

  @Column()
  showcaseYoutubeUrl: string;

  @Column({ default: 'Anonymous' })
  addedBy: string;
 
}
