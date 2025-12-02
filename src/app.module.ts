import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuraFarmerModule } from './aura-farmer/aura-farmer.module';
import { AuraFarmer } from './aura-farmer/entities/aura-farmer.entity';
import { AuraFarmerAddReq } from './aura-farmer/entities/aura-farmer-add-req.entity';
import { AuraFarmShowcase } from './aura-farmer/entities/aura-farm-showcase.entity';
import { AuraShowcaseSubmission } from './aura-farmer/entities/aura-showcase-submission.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 300000,
        limit: 4,
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [AuraFarmer, AuraFarmerAddReq, AuraFarmShowcase, AuraShowcaseSubmission],
      synchronize: false,
    }),
    AuraFarmerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
