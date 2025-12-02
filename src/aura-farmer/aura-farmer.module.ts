import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuraFarmerService } from './aura-farmer.service';
import { AuraFarmerController } from './aura-farmer.controller';
import { AuraFarmer } from './entities/aura-farmer.entity';

import { AuraFarmerAddReq } from './entities/aura-farmer-add-req.entity';
import { AuraFarmShowcase } from './entities/aura-farm-showcase.entity';
import { AuraShowcaseSubmission } from './entities/aura-showcase-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuraFarmer, AuraFarmerAddReq, AuraFarmShowcase, AuraShowcaseSubmission])],
  controllers: [AuraFarmerController],
  providers: [AuraFarmerService],
})
export class AuraFarmerModule {}
