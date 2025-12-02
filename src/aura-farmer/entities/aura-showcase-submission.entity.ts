import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuraShowcaseSubmission {
  @PrimaryGeneratedColumn()
  auraShowcaseSubmissionId: number;

  @Column()
  auraFarmerId: number;

  @Column()
  showcaseYoutubeUrl: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  submittedBy: string

  @Column({ default: 'PENDING' })
  status: string;
 
}
