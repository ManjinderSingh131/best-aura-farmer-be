import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuraFarmerAddReq {
  @PrimaryGeneratedColumn()
  auraFarmerAddReqId: number;

  @Column()
  name: string;

  @Column()
  origin: string;

  @Column()
  description: string;

  @Column({default: 1})
  requestCount: number;

}
